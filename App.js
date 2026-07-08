import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const TABS = ['カメラ', '位置情報', '通知', '振動'];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {activeTab === 0 && <CameraScreen />}
        {activeTab === 1 && <LocationScreen />}
        {activeTab === 2 && <NotificationScreen />}
        {activeTab === 3 && <HapticsScreen />}
      </View>
      <View style={styles.tabBar}>
        {TABS.map((label, index) => (
          <TouchableOpacity
            key={label}
            style={[styles.tabButton, activeTab === index && styles.tabButtonActive]}
            onPress={() => setActiveTab(index)}
          >
            <Text style={[styles.tabText, activeTab === index && styles.tabTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ---------- カメラ機能 ----------
function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);
  const [photoUri, setPhotoUri] = useState(null);

  if (!permission) {
    return <ScreenWrapper title="カメラ"><Text style={styles.info}>読み込み中...</Text></ScreenWrapper>;
  }

  if (!permission.granted) {
    return (
      <ScreenWrapper title="カメラ">
        <Text style={styles.info}>カメラの許可が必要です</Text>
        <Button label="許可する" onPress={requestPermission} />
      </ScreenWrapper>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
    }
  };

  return (
    <ScreenWrapper title="カメラ">
      <View style={styles.cameraBox}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      </View>
      <View style={styles.row}>
        <Button label="撮影" onPress={takePhoto} />
        <Button
          label="切替"
          onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
        />
      </View>
      {photoUri && <Text style={styles.info}>撮影完了: {photoUri.slice(-20)}</Text>}
    </ScreenWrapper>
  );
}

// ---------- 位置情報機能 ----------
function LocationScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('位置情報の許可が拒否されました');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(loc);
  };

  return (
    <ScreenWrapper title="位置情報">
      <Button label="現在地を取得" onPress={getLocation} />
      {errorMsg && <Text style={styles.info}>{errorMsg}</Text>}
      {location && (
        <View style={styles.card}>
          <Text style={styles.info}>緯度: {location.coords.latitude.toFixed(5)}</Text>
          <Text style={styles.info}>経度: {location.coords.longitude.toFixed(5)}</Text>
          <Text style={styles.info}>高度: {location.coords.altitude?.toFixed(1) ?? '-'} m</Text>
        </View>
      )}
    </ScreenWrapper>
  );
}

// ---------- 通知機能 ----------
function NotificationScreen() {
  const [status, setStatus] = useState('');

  const sendNotification = async () => {
    const { status: permStatus } = await Notifications.requestPermissionsAsync();
    if (permStatus !== 'granted') {
      setStatus('通知の許可が拒否されました');
      return;
    }
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'テスト通知',
        body: '5秒後に届く通知です！',
      },
      trigger: { seconds: 5 },
    });
    setStatus('5秒後に通知が届きます');
  };

  return (
    <ScreenWrapper title="通知">
      <Button label="5秒後に通知を送る" onPress={sendNotification} />
      {status !== '' && <Text style={styles.info}>{status}</Text>}
      {Platform.OS === 'ios' && (
        <Text style={styles.note}>
          ※ シミュレーターでは通知が届かない場合があります。実機でお試しください。
        </Text>
      )}
    </ScreenWrapper>
  );
}

// ---------- 振動(ハプティクス)機能 ----------
function HapticsScreen() {
  return (
    <ScreenWrapper title="振動">
      <Button label="軽い振動" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} />
      <Button label="普通の振動" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} />
      <Button label="強い振動" onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)} />
      <Button label="成功通知風" onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)} />
      <Button label="エラー通知風" onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)} />
    </ScreenWrapper>
  );
}

// ---------- 共通パーツ ----------
function ScreenWrapper({ title, children }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

function Button({ label, onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { flex: 1 },
  screen: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  info: { color: '#ddd', fontSize: 14, marginTop: 4 },
  note: { color: '#888', fontSize: 12, marginTop: 12, textAlign: 'center' },
  card: { backgroundColor: '#252542', padding: 16, borderRadius: 12, marginTop: 10, width: '100%' },
  row: { flexDirection: 'row', gap: 10 },
  cameraBox: { width: 280, height: 280, borderRadius: 16, overflow: 'hidden' },
  camera: { flex: 1 },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 4,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#16162a',
  },
  tabButton: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabButtonActive: { borderTopWidth: 2, borderTopColor: '#4f46e5' },
  tabText: { color: '#888', fontSize: 12 },
  tabTextActive: { color: '#fff', fontWeight: '600' },
});
