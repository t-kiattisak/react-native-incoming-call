#import "IncomingCallEventEmitter.h"

#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>

NSString *const IncomingCallEventAnswer = @"RNNotificationAnswerAction";
NSString *const IncomingCallEventEndCall = @"RNNotificationEndCallAction";
NSString *const IncomingCallEventVoipToken = @"RNIncomingCallVoipToken";

static const NSUInteger kMaxPendingEvents = 10;

@interface IncomingCallEventEmitter (BridgeInternal)
+ (void)setBridge:(RCTBridge *)bridge;
@end

@interface IncomingCallBridgeModule : NSObject <RCTBridgeModule>
@end

@implementation IncomingCallBridgeModule

RCT_EXPORT_MODULE(IncomingCallBridge);

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (void)setBridge:(RCTBridge *)bridge
{
  [IncomingCallEventEmitter setBridge:bridge];
}

@end

@implementation IncomingCallEventEmitter

static __weak RCTBridge *sBridge;
static NSMutableArray<NSDictionary *> *sPendingEvents;

+ (void)initialize
{
  if (self == [IncomingCallEventEmitter class]) {
    sPendingEvents = [NSMutableArray array];
  }
}

+ (void)setBridge:(RCTBridge *)bridge
{
  sBridge = bridge;
  [self flushPendingEvents];
}

+ (void)flushPendingEvents
{
  RCTBridge *bridge = sBridge;
  if (bridge == nil || !bridge.isValid) {
    return;
  }
  @synchronized(sPendingEvents) {
    for (NSDictionary *entry in sPendingEvents) {
      [self emitEventName:entry[@"name"] body:entry[@"body"] bridge:bridge];
    }
    [sPendingEvents removeAllObjects];
  }
}

+ (void)queueEventName:(NSString *)name body:(NSDictionary *)body
{
  @synchronized(sPendingEvents) {
    if (sPendingEvents.count >= kMaxPendingEvents) {
      [sPendingEvents removeObjectAtIndex:0];
    }
    [sPendingEvents addObject:@{@"name" : name, @"body" : body ?: @{}}];
  }
}

+ (void)emitEventName:(NSString *)name body:(NSDictionary *)body bridge:(RCTBridge *)bridge
{
  [bridge enqueueJSCall:@"RCTDeviceEventEmitter"
                 method:@"emit"
                   args:@[ name, body ?: @{} ]
             completion:NULL];
}

+ (void)emitEventName:(NSString *)name body:(NSDictionary *)body
{
  RCTBridge *bridge = sBridge;
  if (bridge != nil && bridge.isValid) {
    [self emitEventName:name body:body bridge:bridge];
    return;
  }
  [self queueEventName:name body:body];
}

+ (void)emitAnswerWithCallUUID:(NSString *)callUUID payload:(NSString *)payload
{
  NSMutableDictionary *body = [NSMutableDictionary dictionary];
  body[@"callUUID"] = callUUID;
  if (payload != nil) {
    body[@"payload"] = payload;
  }
  [self emitEventName:IncomingCallEventAnswer body:body];
}

+ (void)emitEndCallWithCallUUID:(NSString *)callUUID
                        payload:(NSString *)payload
                      endAction:(NSString *)endAction
{
  NSMutableDictionary *body = [NSMutableDictionary dictionary];
  body[@"callUUID"] = callUUID;
  body[@"endAction"] = endAction;
  if (payload != nil) {
    body[@"payload"] = payload;
  }
  [self emitEventName:IncomingCallEventEndCall body:body];
}

+ (void)emitVoipToken:(NSString *)token
{
  [self emitEventName:IncomingCallEventVoipToken body:@{@"token" : token}];
}

@end
