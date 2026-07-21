#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

FOUNDATION_EXPORT NSString *const IncomingCallEventAnswer;
FOUNDATION_EXPORT NSString *const IncomingCallEventEndCall;
FOUNDATION_EXPORT NSString *const IncomingCallEventVoipToken;

@interface IncomingCallEventEmitter : NSObject

+ (void)emitAnswerWithCallUUID:(NSString *)callUUID payload:(nullable NSString *)payload;
+ (void)emitEndCallWithCallUUID:(NSString *)callUUID
                        payload:(nullable NSString *)payload
                      endAction:(NSString *)endAction;
+ (void)emitVoipToken:(NSString *)token;

@end

NS_ASSUME_NONNULL_END
