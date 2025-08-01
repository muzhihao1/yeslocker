package org.linlinjava.litemall.wx.web;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import cn.binarywang.wx.miniapp.bean.WxMaPhoneNumberInfo;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.linlinjava.litemall.core.notify.NotifyService;
import org.linlinjava.litemall.core.notify.NotifyType;
import org.linlinjava.litemall.core.util.CharUtil;
import org.linlinjava.litemall.core.util.JacksonUtil;
import org.linlinjava.litemall.core.util.RegexUtil;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.util.bcrypt.BCryptPasswordEncoder;
import org.linlinjava.litemall.db.domain.LitemallUser;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.service.CouponAssignService;
import org.linlinjava.litemall.db.service.LitemallUserService;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.linlinjava.litemall.wx.annotation.LoginUser;
import org.linlinjava.litemall.wx.dto.UserInfo;
import org.linlinjava.litemall.wx.dto.UserToken;
import org.linlinjava.litemall.wx.dto.WxLoginInfo;
import org.linlinjava.litemall.wx.service.CaptchaCodeManager;
import org.linlinjava.litemall.wx.service.UserTokenManager;
import org.linlinjava.litemall.core.util.IpUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.linlinjava.litemall.wx.util.WxResponseCode.*;

/**
 * 鉴权服务
 */
@RestController
@RequestMapping("/wx/auth")
@Validated
public class WxAuthController {
    private final Log logger = LogFactory.getLog(WxAuthController.class);
    
    @Value("${litemall.wx.mock-mode:false}")
    private boolean mockMode;

    @Autowired
    private LitemallUserService userService;
    
    @Autowired
    private LitemallLockerService lockerService;

    @Autowired
    private WxMaService wxService;

    @Autowired
    private NotifyService notifyService;

    @Autowired
    private CouponAssignService couponAssignService;

    /**
     * 账号登录
     *
     * @param body    请求内容，{ username: xxx, password: xxx }
     * @param request 请求对象
     * @return 登录结果
     */
    @PostMapping("login")
    public Object login(@RequestBody String body, HttpServletRequest request) {
        String username = JacksonUtil.parseString(body, "username");
        String password = JacksonUtil.parseString(body, "password");
        if (username == null || password == null) {
            return ResponseUtil.badArgument();
        }

        List<LitemallUser> userList = userService.queryByUsername(username);
        LitemallUser user = null;
        if (userList.size() > 1) {
            return ResponseUtil.serious();
        } else if (userList.size() == 0) {
            return ResponseUtil.fail(AUTH_INVALID_ACCOUNT, "账号不存在");
        } else {
            user = userList.get(0);
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (!encoder.matches(password, user.getPassword())) {
            return ResponseUtil.fail(AUTH_INVALID_ACCOUNT, "账号密码不对");
        }

        // 更新登录情况
        user.setLastLoginTime(LocalDateTime.now());
        user.setLastLoginIp(IpUtil.getIpAddr(request));
        if (userService.updateById(user) == 0) {
            return ResponseUtil.updatedDataFailed();
        }

        // userInfo
        UserInfo userInfo = new UserInfo();
        userInfo.setNickName(username);
        userInfo.setAvatarUrl(user.getAvatar());

        // token
        String token = UserTokenManager.generateToken(user.getId());

        Map<Object, Object> result = new HashMap<Object, Object>();
        result.put("token", token);
        result.put("userInfo", userInfo);
        return ResponseUtil.ok(result);
    }

    /**
     * 微信登录
     *
     * @param wxLoginInfo 请求内容，{ code: xxx, userInfo: xxx }
     * @param request     请求对象
     * @return 登录结果
     */
    @PostMapping("login_by_weixin")
    public Object loginByWeixin(@RequestBody WxLoginInfo wxLoginInfo, HttpServletRequest request) {
        String code = wxLoginInfo.getCode();
        UserInfo userInfo = wxLoginInfo.getUserInfo();
        if (code == null || userInfo == null) {
            return ResponseUtil.badArgument();
        }

        String sessionKey = null;
        String openId = null;
        
        // Mock mode for development
        if (mockMode) {
            logger.info("[Mock Mode] WeChat login with code: " + code);
            sessionKey = "mock-session-key-" + System.currentTimeMillis();
            openId = generateMockOpenId(code);
        } else {
            try {
                WxMaJscode2SessionResult result = this.wxService.getUserService().getSessionInfo(code);
                sessionKey = result.getSessionKey();
                openId = result.getOpenid();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        if (sessionKey == null || openId == null) {
            return ResponseUtil.fail();
        }

        LitemallUser user = userService.queryByOid(openId);
        if (user == null) {
            user = new LitemallUser();
            user.setUsername(openId);
            user.setPassword(openId);
            user.setWeixinOpenid(openId);
            user.setAvatar(userInfo.getAvatarUrl());
            user.setNickname(userInfo.getNickName());
            user.setGender(userInfo.getGender());
            user.setUserLevel((byte) 0);
            user.setStatus((byte) 0);
            user.setLastLoginTime(LocalDateTime.now());
            user.setLastLoginIp(IpUtil.getIpAddr(request));
            user.setSessionKey(sessionKey);
            
            // Apply mock user data in mock mode
            if (mockMode) {
                setupMockUserData(user, openId);
            }

            userService.add(user);

            // 新用户发送注册优惠券
            couponAssignService.assignForRegister(user.getId());
        } else {
            user.setLastLoginTime(LocalDateTime.now());
            user.setLastLoginIp(IpUtil.getIpAddr(request));
            user.setSessionKey(sessionKey);
            if (userService.updateById(user) == 0) {
                return ResponseUtil.updatedDataFailed();
            }
        }

        // token
        String token = UserTokenManager.generateToken(user.getId());

        Map<Object, Object> result = new HashMap<Object, Object>();
        result.put("token", token);
        result.put("userInfo", userInfo);
        return ResponseUtil.ok(result);
    }


    /**
     * 请求注册验证码
     *
     * TODO
     * 这里需要一定机制防止短信验证码被滥用
     *
     * @param body 手机号码 { mobile }
     * @return
     */
    @PostMapping("regCaptcha")
    public Object registerCaptcha(@RequestBody String body) {
        String phoneNumber = JacksonUtil.parseString(body, "mobile");
        if (StringUtils.isEmpty(phoneNumber)) {
            return ResponseUtil.badArgument();
        }
        if (!RegexUtil.isMobileSimple(phoneNumber)) {
            return ResponseUtil.badArgumentValue();
        }

        if (!notifyService.isSmsEnable()) {
            return ResponseUtil.fail(AUTH_CAPTCHA_UNSUPPORT, "小程序后台验证码服务不支持");
        }
        String code = CharUtil.getRandomNum(6);
        boolean successful = CaptchaCodeManager.addToCache(phoneNumber, code);
        if (!successful) {
            return ResponseUtil.fail(AUTH_CAPTCHA_FREQUENCY, "验证码未超时1分钟，不能发送");
        }
        notifyService.notifySmsTemplate(phoneNumber, NotifyType.CAPTCHA, new String[]{code});

        return ResponseUtil.ok();
    }

    /**
     * 账号注册
     *
     * @param body    请求内容
     *                {
     *                username: xxx,
     *                password: xxx,
     *                mobile: xxx
     *                code: xxx
     *                }
     *                其中code是手机验证码，目前还不支持手机短信验证码
     * @param request 请求对象
     * @return 登录结果
     * 成功则
     * {
     * errno: 0,
     * errmsg: '成功',
     * data:
     * {
     * token: xxx,
     * tokenExpire: xxx,
     * userInfo: xxx
     * }
     * }
     * 失败则 { errno: XXX, errmsg: XXX }
     */
    @PostMapping("register")
    public Object register(@RequestBody String body, HttpServletRequest request) {
        String username = JacksonUtil.parseString(body, "username");
        String password = JacksonUtil.parseString(body, "password");
        String mobile = JacksonUtil.parseString(body, "mobile");
        String code = JacksonUtil.parseString(body, "code");
        // 如果是小程序注册，则必须非空
        // 其他情况，可以为空
        String wxCode = JacksonUtil.parseString(body, "wxCode");

        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(password) || StringUtils.isEmpty(mobile)
                || StringUtils.isEmpty(code)) {
            return ResponseUtil.badArgument();
        }

        List<LitemallUser> userList = userService.queryByUsername(username);
        if (userList.size() > 0) {
            return ResponseUtil.fail(AUTH_NAME_REGISTERED, "用户名已注册");
        }

        userList = userService.queryByMobile(mobile);
        if (userList.size() > 0) {
            return ResponseUtil.fail(AUTH_MOBILE_REGISTERED, "手机号已注册");
        }
        if (!RegexUtil.isMobileSimple(mobile)) {
            return ResponseUtil.fail(AUTH_INVALID_MOBILE, "手机号格式不正确");
        }
        //判断验证码是否正确
        String cacheCode = CaptchaCodeManager.getCachedCaptcha(mobile);
        if (cacheCode == null || cacheCode.isEmpty() || !cacheCode.equals(code)) {
            return ResponseUtil.fail(AUTH_CAPTCHA_UNMATCH, "验证码错误");
        }

        String openId = "";
        // 非空，则是小程序注册
        // 继续验证openid
        if(!StringUtils.isEmpty(wxCode)) {
            try {
                WxMaJscode2SessionResult result = this.wxService.getUserService().getSessionInfo(wxCode);
                openId = result.getOpenid();
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseUtil.fail(AUTH_OPENID_UNACCESS, "openid 获取失败");
            }
            userList = userService.queryByOpenid(openId);
            if (userList.size() > 1) {
                return ResponseUtil.serious();
            }
            if (userList.size() == 1) {
                LitemallUser checkUser = userList.get(0);
                String checkUsername = checkUser.getUsername();
                String checkPassword = checkUser.getPassword();
                if (!checkUsername.equals(openId) || !checkPassword.equals(openId)) {
                    return ResponseUtil.fail(AUTH_OPENID_BINDED, "openid已绑定账号");
                }
            }
        }

        LitemallUser user = null;
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encodedPassword = encoder.encode(password);
        user = new LitemallUser();
        user.setUsername(username);
        user.setPassword(encodedPassword);
        user.setMobile(mobile);
        user.setWeixinOpenid(openId);
        user.setAvatar("https://yanxuan.nosdn.127.net/80841d741d7fa3073e0ae27bf487339f.jpg?imageView&quality=90&thumbnail=64x64");
        user.setNickname(username);
        user.setGender((byte) 0);
        user.setUserLevel((byte) 0);
        user.setStatus((byte) 0);
        user.setLastLoginTime(LocalDateTime.now());
        user.setLastLoginIp(IpUtil.getIpAddr(request));
        userService.add(user);

        // 给新用户发送注册优惠券
        couponAssignService.assignForRegister(user.getId());

        // userInfo
        UserInfo userInfo = new UserInfo();
        userInfo.setNickName(username);
        userInfo.setAvatarUrl(user.getAvatar());

        // token
        String token = UserTokenManager.generateToken(user.getId());

        Map<Object, Object> result = new HashMap<Object, Object>();
        result.put("token", token);
        result.put("userInfo", userInfo);
        return ResponseUtil.ok(result);
    }

    /**
     * 请求验证码
     *
     * TODO
     * 这里需要一定机制防止短信验证码被滥用
     *
     * @param body 手机号码 { mobile: xxx, type: xxx }
     * @return
     */
    @PostMapping("captcha")
    public Object captcha(@LoginUser Integer userId, @RequestBody String body) {
        if(userId == null){
            return ResponseUtil.unlogin();
        }
        String phoneNumber = JacksonUtil.parseString(body, "mobile");
        String captchaType = JacksonUtil.parseString(body, "type");
        if (StringUtils.isEmpty(phoneNumber)) {
            return ResponseUtil.badArgument();
        }
        if (!RegexUtil.isMobileSimple(phoneNumber)) {
            return ResponseUtil.badArgumentValue();
        }
        if (StringUtils.isEmpty(captchaType)) {
            return ResponseUtil.badArgument();
        }

        if (!notifyService.isSmsEnable()) {
            return ResponseUtil.fail(AUTH_CAPTCHA_UNSUPPORT, "小程序后台验证码服务不支持");
        }
        String code = CharUtil.getRandomNum(6);
        boolean successful = CaptchaCodeManager.addToCache(phoneNumber, code);
        if (!successful) {
            return ResponseUtil.fail(AUTH_CAPTCHA_FREQUENCY, "验证码未超时1分钟，不能发送");
        }
        notifyService.notifySmsTemplate(phoneNumber, NotifyType.CAPTCHA, new String[]{code});

        return ResponseUtil.ok();
    }

    /**
     * 账号密码重置
     *
     * @param body    请求内容
     *                {
     *                password: xxx,
     *                mobile: xxx
     *                code: xxx
     *                }
     *                其中code是手机验证码，目前还不支持手机短信验证码
     * @param request 请求对象
     * @return 登录结果
     * 成功则 { errno: 0, errmsg: '成功' }
     * 失败则 { errno: XXX, errmsg: XXX }
     */
    @PostMapping("reset")
    public Object reset(@RequestBody String body, HttpServletRequest request) {
        String password = JacksonUtil.parseString(body, "password");
        String mobile = JacksonUtil.parseString(body, "mobile");
        String code = JacksonUtil.parseString(body, "code");

        if (mobile == null || code == null || password == null) {
            return ResponseUtil.badArgument();
        }

        //判断验证码是否正确
        String cacheCode = CaptchaCodeManager.getCachedCaptcha(mobile);
        if (cacheCode == null || cacheCode.isEmpty() || !cacheCode.equals(code))
            return ResponseUtil.fail(AUTH_CAPTCHA_UNMATCH, "验证码错误");

        List<LitemallUser> userList = userService.queryByMobile(mobile);
        LitemallUser user = null;
        if (userList.size() > 1) {
            return ResponseUtil.serious();
        } else if (userList.size() == 0) {
            return ResponseUtil.fail(AUTH_MOBILE_UNREGISTERED, "手机号未注册");
        } else {
            user = userList.get(0);
        }

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String encodedPassword = encoder.encode(password);
        user.setPassword(encodedPassword);

        if (userService.updateById(user) == 0) {
            return ResponseUtil.updatedDataFailed();
        }

        return ResponseUtil.ok();
    }

    /**
     * 账号手机号码重置
     *
     * @param body    请求内容
     *                {
     *                password: xxx,
     *                mobile: xxx
     *                code: xxx
     *                }
     *                其中code是手机验证码，目前还不支持手机短信验证码
     * @param request 请求对象
     * @return 登录结果
     * 成功则 { errno: 0, errmsg: '成功' }
     * 失败则 { errno: XXX, errmsg: XXX }
     */
    @PostMapping("resetPhone")
    public Object resetPhone(@LoginUser Integer userId, @RequestBody String body, HttpServletRequest request) {
        if(userId == null){
            return ResponseUtil.unlogin();
        }
        String password = JacksonUtil.parseString(body, "password");
        String mobile = JacksonUtil.parseString(body, "mobile");
        String code = JacksonUtil.parseString(body, "code");

        if (mobile == null || code == null || password == null) {
            return ResponseUtil.badArgument();
        }

        //判断验证码是否正确
        String cacheCode = CaptchaCodeManager.getCachedCaptcha(mobile);
        if (cacheCode == null || cacheCode.isEmpty() || !cacheCode.equals(code))
            return ResponseUtil.fail(AUTH_CAPTCHA_UNMATCH, "验证码错误");

        List<LitemallUser> userList = userService.queryByMobile(mobile);
        LitemallUser user = null;
        if (userList.size() > 1) {
            return ResponseUtil.fail(AUTH_MOBILE_REGISTERED, "手机号已注册");
        }
        user = userService.findById(userId);

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        if (!encoder.matches(password, user.getPassword())) {
            return ResponseUtil.fail(AUTH_INVALID_ACCOUNT, "账号密码不对");
        }

        user.setMobile(mobile);
        if (userService.updateById(user) == 0) {
            return ResponseUtil.updatedDataFailed();
        }

        return ResponseUtil.ok();
    }

    /**
     * 账号信息更新
     *
     * @param body    请求内容
     *                {
     *                password: xxx,
     *                mobile: xxx
     *                code: xxx
     *                }
     *                其中code是手机验证码，目前还不支持手机短信验证码
     * @param request 请求对象
     * @return 登录结果
     * 成功则 { errno: 0, errmsg: '成功' }
     * 失败则 { errno: XXX, errmsg: XXX }
     */
    @PostMapping("profile")
    public Object profile(@LoginUser Integer userId, @RequestBody String body, HttpServletRequest request) {
        if(userId == null){
            return ResponseUtil.unlogin();
        }
        String avatar = JacksonUtil.parseString(body, "avatar");
        Byte gender = JacksonUtil.parseByte(body, "gender");
        String nickname = JacksonUtil.parseString(body, "nickname");

        LitemallUser user = userService.findById(userId);
        if(!StringUtils.isEmpty(avatar)){
            user.setAvatar(avatar);
        }
        if(gender != null){
            user.setGender(gender);
        }
        if(!StringUtils.isEmpty(nickname)){
            user.setNickname(nickname);
        }

        if (userService.updateById(user) == 0) {
            return ResponseUtil.updatedDataFailed();
        }

        return ResponseUtil.ok();
    }

    /**
     * 微信手机号码绑定
     *
     * @param userId
     * @param body
     * @return
     */
    @PostMapping("bindPhone")
    public Object bindPhone(@LoginUser Integer userId, @RequestBody String body) {
    	if (userId == null) {
            return ResponseUtil.unlogin();
        }
    	LitemallUser user = userService.findById(userId);
        String encryptedData = JacksonUtil.parseString(body, "encryptedData");
        String iv = JacksonUtil.parseString(body, "iv");
        WxMaPhoneNumberInfo phoneNumberInfo = this.wxService.getUserService().getPhoneNoInfo(user.getSessionKey(), encryptedData, iv);
        String phone = phoneNumberInfo.getPhoneNumber();
        user.setMobile(phone);
        if (userService.updateById(user) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok();
    }

    @PostMapping("logout")
    public Object logout(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        return ResponseUtil.ok();
    }

    @GetMapping("info")
    public Object info(@LoginUser Integer userId) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        LitemallUser user = userService.findById(userId);
        Map<Object, Object> data = new HashMap<Object, Object>();
        data.put("nickName", user.getNickname());
        data.put("avatar", user.getAvatar());
        data.put("gender", user.getGender());
        data.put("mobile", user.getMobile());

        return ResponseUtil.ok(data);
    }
    
    /**
     * Get mock test users information (only available in mock mode)
     * @return List of available test codes and their descriptions
     */
    @GetMapping("mock-users")
    public Object getMockUsers() {
        if (!mockMode) {
            return ResponseUtil.fail(403, "Mock mode is not enabled");
        }
        
        Map<String, Object> mockUsers = new HashMap<>();
        mockUsers.put("description", "Use these codes in WeChat login to generate different test users");
        
        List<Map<String, String>> users = new ArrayList<>();
        
        Map<String, String> newUser = new HashMap<>();
        newUser.put("code", "test-new-user-001");
        newUser.put("description", "New user without verification");
        newUser.put("features", "No mobile, no locker assigned");
        users.add(newUser);
        
        Map<String, String> verifiedUser = new HashMap<>();
        verifiedUser.put("code", "test-verified-user-001");
        verifiedUser.put("description", "Verified user with locker");
        verifiedUser.put("features", "Mobile verified, locker assigned");
        users.add(verifiedUser);
        
        Map<String, String> activeStorageUser = new HashMap<>();
        activeStorageUser.put("code", "test-active-storage-001");
        activeStorageUser.put("description", "User with active storage");
        activeStorageUser.put("features", "Has cue stick stored in locker");
        users.add(activeStorageUser);
        
        Map<String, String> expiredStorageUser = new HashMap<>();
        expiredStorageUser.put("code", "test-expired-storage-001");
        expiredStorageUser.put("description", "User with expired storage");
        expiredStorageUser.put("features", "Storage period exceeded 30 days");
        users.add(expiredStorageUser);
        
        Map<String, String> vipUser = new HashMap<>();
        vipUser.put("code", "test-vip-user-001");
        vipUser.put("description", "VIP member");
        vipUser.put("features", "VIP privileges, priority access");
        users.add(vipUser);
        
        Map<String, String> adminUser = new HashMap<>();
        adminUser.put("code", "test-admin-001");
        adminUser.put("description", "Admin user");
        adminUser.put("features", "System administrator privileges");
        users.add(adminUser);
        
        mockUsers.put("users", users);
        return ResponseUtil.ok(mockUsers);
    }

    /**
     * 身份验证
     * 用于注册流程中的身份验证步骤
     *
     * @param body 请求内容
     *             {
     *             realName: xxx,
     *             idCard: xxx,
     *             mobile: xxx,
     *             smsCode: xxx
     *             }
     * @return 验证结果
     */
    @PostMapping("verify")
    public Object verify(@LoginUser Integer userId, @RequestBody String body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        String realName = JacksonUtil.parseString(body, "realName");
        String idCard = JacksonUtil.parseString(body, "idCard");
        String mobile = JacksonUtil.parseString(body, "mobile");
        String smsCode = JacksonUtil.parseString(body, "smsCode");

        if (StringUtils.isEmpty(realName) || StringUtils.isEmpty(idCard) || 
            StringUtils.isEmpty(mobile) || StringUtils.isEmpty(smsCode)) {
            return ResponseUtil.badArgument();
        }

        // 验证手机号格式
        if (!RegexUtil.isMobileSimple(mobile)) {
            return ResponseUtil.fail(AUTH_INVALID_MOBILE, "手机号格式不正确");
        }

        // 验证短信验证码
        String cacheCode = CaptchaCodeManager.getCachedCaptcha(mobile);
        if (cacheCode == null || cacheCode.isEmpty() || !cacheCode.equals(smsCode)) {
            return ResponseUtil.fail(AUTH_CAPTCHA_UNMATCH, "验证码错误");
        }

        // TODO: 这里可以调用第三方身份验证服务验证身份证信息
        // 目前仅做基本格式校验
        if (!RegexUtil.isIdCard(idCard)) {
            return ResponseUtil.fail(701, "身份证号格式不正确");
        }

        // 更新用户信息
        LitemallUser user = userService.findById(userId);
        user.setMobile(mobile);
        // TODO: 添加实名信息字段到用户表
        // user.setRealName(realName);
        // user.setIdCard(idCard);
        // user.setIdentityVerified(true);
        
        if (userService.updateById(user) == 0) {
            return ResponseUtil.updatedDataFailed();
        }

        return ResponseUtil.ok();
    }

    /**
     * 完成注册（包含身份验证和储物柜分配）
     * 
     * @param userId 用户ID
     * @param body 请求体 {
     *             realName: xxx,
     *             idCard: xxx,
     *             mobile: xxx,
     *             smsCode: xxx,
     *             lockerId: xxx,
     *             storeId: xxx
     *             }
     * @return 注册结果
     */
    @PostMapping("complete-registration")
    public Object completeRegistration(@LoginUser Integer userId, @RequestBody String body) {
        if (userId == null) {
            return ResponseUtil.unlogin();
        }

        String realName = JacksonUtil.parseString(body, "realName");
        String idCard = JacksonUtil.parseString(body, "idCard");
        String mobile = JacksonUtil.parseString(body, "mobile");
        String smsCode = JacksonUtil.parseString(body, "smsCode");
        Integer lockerId = JacksonUtil.parseInteger(body, "lockerId");
        Integer storeId = JacksonUtil.parseInteger(body, "storeId");

        if (StringUtils.isEmpty(realName) || StringUtils.isEmpty(idCard) || 
            StringUtils.isEmpty(mobile) || StringUtils.isEmpty(smsCode) ||
            lockerId == null || storeId == null) {
            return ResponseUtil.badArgument();
        }

        // 验证手机号格式
        if (!RegexUtil.isMobileSimple(mobile)) {
            return ResponseUtil.fail(AUTH_INVALID_MOBILE, "手机号格式不正确");
        }

        // 验证短信验证码
        String cacheCode = CaptchaCodeManager.getCachedCaptcha(mobile);
        if (cacheCode == null || cacheCode.isEmpty() || !cacheCode.equals(smsCode)) {
            return ResponseUtil.fail(AUTH_CAPTCHA_UNMATCH, "验证码错误");
        }

        // 验证身份证格式
        if (!RegexUtil.isIdCard(idCard)) {
            return ResponseUtil.fail(701, "身份证号格式不正确");
        }

        // 检查用户是否已经有储物柜
        LitemallUser user = userService.findById(userId);
        if (user.getLockerId() != null) {
            return ResponseUtil.fail(502, "您已经有专属储物柜了");
        }

        // 检查储物柜是否存在且可用
        LitemallLocker locker = lockerService.findById(lockerId);
        if (locker == null) {
            return ResponseUtil.fail(503, "储物柜不存在");
        }
        
        // 验证储物柜是否属于选择的门店
        if (!locker.getStoreId().equals(storeId)) {
            return ResponseUtil.fail(504, "储物柜不属于选择的门店");
        }
        
        if (!"available".equals(locker.getStatus())) {
            return ResponseUtil.fail(505, "该储物柜不可用");
        }

        try {
            // 更新用户信息
            user.setMobile(mobile);
            user.setLockerId(lockerId);
            user.setStoreId(storeId);
            // TODO: 添加实名信息字段到用户表
            // user.setRealName(realName);
            // user.setIdCard(idCard);
            // user.setIdentityVerified(true);
            userService.updateById(user);
            
            // 更新储物柜状态为已分配
            locker.setAssignedUserId(userId);
            locker.setStatus("assigned");
            locker.setCurrentUserId(userId);
            lockerService.updateById(locker);

            // 返回用户信息
            UserInfo userInfo = new UserInfo();
            userInfo.setNickName(user.getNickname());
            userInfo.setAvatarUrl(user.getAvatar());
            userInfo.setMobile(user.getMobile());
            
            Map<String, Object> result = new HashMap<>();
            result.put("token", UserTokenManager.generateToken(userId));
            result.put("userInfo", userInfo);
            
            return ResponseUtil.ok(result);
        } catch (Exception e) {
            logger.error("完成注册失败", e);
            return ResponseUtil.fail(506, "注册失败，请重试");
        }
    }
    
    /**
     * Generate mock OpenID based on code for testing
     */
    private String generateMockOpenId(String code) {
        if (code == null || code.isEmpty()) {
            return "mock-openid-" + System.currentTimeMillis();
        }
        
        // Different codes generate different mock users
        if (code.startsWith("test-new-user")) {
            return "mock-new-user-" + code.substring(14);
        } else if (code.startsWith("test-verified-user")) {
            return "mock-verified-user-" + code.substring(19);
        } else if (code.startsWith("test-active-storage")) {
            return "mock-active-storage-" + code.substring(20);
        } else if (code.startsWith("test-expired-storage")) {
            return "mock-expired-storage-" + code.substring(21);
        } else if (code.startsWith("test-vip-user")) {
            return "mock-vip-user-" + code.substring(14);
        } else if (code.startsWith("test-admin")) {
            return "mock-admin-user-" + code.substring(11);
        }
        
        // Default mock user
        return "mock-default-user-" + Math.abs(code.hashCode());
    }
    
    /**
     * Create mock user data for different test scenarios
     */
    private void setupMockUserData(LitemallUser user, String openId) {
        if (openId.startsWith("mock-verified-user")) {
            // Verified user with complete profile
            user.setMobile("13800138001");
            user.setUserLevel((byte) 1);
            user.setLockerId(5);
            user.setStoreId(1);
        } else if (openId.startsWith("mock-active-storage")) {
            // User with active storage
            user.setMobile("13800138002");
            user.setUserLevel((byte) 1);
            user.setLockerId(10);
            user.setStoreId(1);
            // Note: Storage record should be created separately
        } else if (openId.startsWith("mock-expired-storage")) {
            // User with expired storage
            user.setMobile("13800138003");
            user.setUserLevel((byte) 1);
            user.setLockerId(15);
            user.setStoreId(1);
        } else if (openId.startsWith("mock-vip-user")) {
            // VIP user
            user.setMobile("13800138004");
            user.setUserLevel((byte) 2); // VIP level
            user.setLockerId(20);
            user.setStoreId(1);
        } else if (openId.startsWith("mock-admin-user")) {
            // Admin user
            user.setMobile("13800138888");
            user.setUserLevel((byte) 3); // Admin level
        }
    }
}
