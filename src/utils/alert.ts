import { Alert, Platform } from 'react-native';

/** Alert.alert is a no-op in react-native-web; fall back to the browser's alert. */
export function showAlert(title: string, message: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}
