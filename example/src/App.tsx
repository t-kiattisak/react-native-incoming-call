import { useEffect, useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useIncomingCall, show, dismiss, on, off, backToApp, registerVoipPush, onVoipToken, offVoipToken } from 'rn-incoming-call-nitro';

function createCallUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'danger';
}

export default function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'hooks' | 'functions'>('hooks');

  const addLog = (message: string, type: 'info' | 'success' | 'danger' = 'info') => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs((prev) => [{ timestamp: timeStr, message, type }, ...prev]);
  };

  useEffect(() => {
    addLog('App mounted. Checking permissions...', 'info');

    const requestPermissions = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        if (!hasPermission) {
          addLog('Requesting notification permission...', 'info');
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            addLog('Notification permission granted', 'success');
          } else {
            addLog('Notification permission denied', 'danger');
          }
        }
      }
    };
    requestPermissions();

    if (Platform.OS === 'ios') {
      onVoipToken((payload) => {
        addLog('[iOS] VoIP token registered (send to your backend over HTTPS)', 'info');
        if (__DEV__) {
          addLog(`[iOS] Token length: ${payload.token.length}`, 'info');
        }
      });
      registerVoipPush();
      addLog('[iOS] CallKit + PushKit registration started', 'info');
    }

    return () => {
      if (Platform.OS === 'ios') {
        offVoipToken();
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Call</Text>
        <Text style={styles.headerSubtitle}>
          Nitro Module Interactive Test App
          {Platform.OS === 'ios' ? ' · iOS uses system CallKit UI' : ''}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trigger Controls</Text>
        
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'hooks' && styles.tabButtonActive]}
            onPress={() => setActiveTab('hooks')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'hooks' && styles.tabButtonTextActive]}>
              1. React Hooks
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'functions' && styles.tabButtonActive]}
            onPress={() => setActiveTab('functions')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'functions' && styles.tabButtonTextActive]}>
              2. Direct Functions
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'hooks' ? (
          <HookDemoView addLog={addLog} />
        ) : (
          <DirectFunctionDemoView addLog={addLog} />
        )}
      </View>

      {/* Live Event Logs */}
      <View style={[styles.card, styles.logCard]}>
        <View style={styles.logHeader}>
          <Text style={styles.cardTitle}>Live Event Logs</Text>
          <TouchableOpacity onPress={() => setLogs([])}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {logs.length === 0 ? (
          <View style={styles.emptyLog}>
            <Text style={styles.emptyLogText}>No events logged yet. Trigger a call to start testing.</Text>
          </View>
        ) : (
          <ScrollView style={styles.logList} contentContainerStyle={{ paddingBottom: 10 }}>
            {logs.map((log, idx) => (
              <View key={idx} style={styles.logEntry}>
                <Text style={styles.logTime}>{log.timestamp}</Text>
                <Text
                  style={[
                    styles.logMsg,
                    log.type === 'success' && styles.logSuccess,
                    log.type === 'danger' && styles.logDanger,
                  ]}
                >
                  {log.message}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 1. DEMO VIEW USING CUSTOM HOOKS
// ==========================================
interface DemoViewProps {
  addLog: (message: string, type?: 'info' | 'success' | 'danger') => void;
}

function HookDemoView({ addLog }: DemoViewProps) {
  const { isActive, callUUID, activeCallCount, show, dismiss } = useIncomingCall({
    onAnswer: (payload) => {
      addLog(`[Hook] 📞 Call Answered! UUID: ${payload.callUUID}`, 'success');
      Alert.alert(
        'Call Answered',
        `UUID: ${payload.callUUID}\nPayload: ${JSON.stringify(payload.payload)}`
      );
      backToApp();
    },
    onEndCall: (payload) => {
      addLog(`[Hook] ❌ Call Ended (Action: ${payload.endAction})`, 'danger');
      Alert.alert('Call Declined', `UUID: ${payload.callUUID}\nAction: ${payload.endAction}`);
    },
  });

  const triggerCall = () => {
    const uuid = createCallUuid();
    addLog(`[Hook] Showing call... (UUID: ${uuid})`, 'info');
    if (Platform.OS === 'ios') {
      addLog(
        '[iOS] CallKit is system UI — use a physical device; on Simulator it often does not appear while this app is foreground.',
        'info'
      );
    }

    show(uuid, 'https://i.pravatar.cc/300', 15000, {
      channelId: 'incoming_call_channel',
      channelName: 'Incoming Calls',
      notificationIcon: 'ic_launcher',
      notificationTitle: 'Kiattisak Jomram (Hook)',
      notificationBody: 'Incoming call via useIncomingCall...',
      answerText: 'Accept Call',
      declineText: 'Decline',
      isVideo: true,
    });
  };

  return (
    <View style={styles.demoContainer}>
      <Text style={styles.demoDesc}>
        Highly recommended for standard UI screens. The custom hook manages callbacks, updates state reactivity, and handles automatic cleanup on unmount.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Hook State:</Text>
        <Text style={[styles.statusText, isActive ? styles.statusActive : styles.statusInactive]}>
          {isActive
            ? `📞 ACTIVE (${activeCallCount} stacked, latest: ${callUUID})`
            : '💤 INACTIVE'}
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={triggerCall}>
        <Text style={styles.primaryButtonText}>Show Call (Hook)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={dismiss}>
        <Text style={styles.secondaryButtonText}>Dismiss Notification</Text>
      </TouchableOpacity>
    </View>
  );
}

// ==========================================
// 2. DEMO VIEW USING DIRECT FUNCTIONS
// ==========================================
function DirectFunctionDemoView({ addLog }: DemoViewProps) {
  const [isActive, setIsActive] = useState(false);
  const [callUUID, setCallUUID] = useState<string | null>(null);

  useEffect(() => {
    addLog('[Direct] Subscribing to events manually via on()', 'info');

    on('answer', (payload) => {
      setIsActive(false);
      setCallUUID(null);
      addLog(`[Direct] 📞 Call Answered! UUID: ${payload.callUUID}`, 'success');
      Alert.alert(
        'Call Answered',
        `UUID: ${payload.callUUID}\nPayload: ${JSON.stringify(payload.payload)}`
      );
      backToApp();
    });

    on('endCall', (payload) => {
      setIsActive(false);
      setCallUUID(null);
      addLog(`[Direct] ❌ Call Ended (Action: ${payload.endAction})`, 'danger');
      Alert.alert('Call Declined', `UUID: ${payload.callUUID}\nAction: ${payload.endAction}`);
    });

    return () => {
      addLog('[Direct] Unsubscribing manually via off()', 'info');
      off('answer');
      off('endCall');
    };
  }, []);

  const triggerCall = () => {
    const uuid = createCallUuid();
    setCallUUID(uuid);
    setIsActive(true);
    addLog(`[Direct] Showing call... (UUID: ${uuid})`, 'info');
    if (Platform.OS === 'ios') {
      addLog(
        '[iOS] CallKit is system UI — use a physical device; Simulator may not show incoming UI in foreground.',
        'info'
      );
    }

    show(uuid, 'https://i.pravatar.cc/300', 15000, {
      channelId: 'incoming_call_channel',
      channelName: 'Incoming Calls',
      notificationIcon: 'ic_launcher',
      notificationTitle: 'Kiattisak Jomram (Direct)',
      notificationBody: 'Incoming call via direct function...',
      answerText: 'Accept Call',
      declineText: 'Decline',
      isVideo: true,
    });
  };

  const cancelCall = () => {
    setIsActive(false);
    setCallUUID(null);
    addLog('[Direct] Dismissing call...', 'info');
    dismiss();
  };

  return (
    <View style={styles.demoContainer}>
      <Text style={styles.demoDesc}>
        Required for background tasks or Headless JS contexts where React hooks cannot run. Requires manual event subscriptions, state tracking, and cleanup.
      </Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Manual State:</Text>
        <Text style={[styles.statusText, isActive ? styles.statusActive : styles.statusInactive]}>
          {isActive ? `📞 ACTIVE (UUID: ${callUUID})` : '💤 INACTIVE'}
        </Text>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={triggerCall}>
        <Text style={styles.primaryButtonText}>Show Call (Direct Functions)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={cancelCall}>
        <Text style={styles.secondaryButtonText}>Dismiss Notification</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1017',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#808290',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#161722',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#232536',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0D0E15',
    borderRadius: 10,
    padding: 4,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#232536',
  },
  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#6A1B9A',
  },
  tabButtonText: {
    fontSize: 13,
    color: '#808290',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  demoContainer: {
    marginTop: 8,
  },
  demoDesc: {
    fontSize: 13,
    color: '#808290',
    lineHeight: 18,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1D2A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D2F44',
  },
  statusLabel: {
    fontSize: 14,
    color: '#808290',
    marginRight: 8,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#4CAF50',
  },
  statusInactive: {
    color: '#808290',
  },
  primaryButton: {
    backgroundColor: '#6A1B9A',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F4156',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D1D2DC',
  },
  logCard: {
    flex: 1,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearText: {
    fontSize: 14,
    color: '#8A4FFF',
    fontWeight: '600',
  },
  emptyLog: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyLogText: {
    fontSize: 14,
    color: '#5C5D6E',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  logList: {
    flex: 1,
  },
  logEntry: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#202232',
  },
  logTime: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#5C5D6E',
    marginRight: 12,
    alignSelf: 'center',
  },
  logMsg: {
    fontSize: 13,
    color: '#D1D2DC',
    flex: 1,
  },
  logSuccess: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  logDanger: {
    color: '#F44336',
    fontWeight: '600',
  },
});


