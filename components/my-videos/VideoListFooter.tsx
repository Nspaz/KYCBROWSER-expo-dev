import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

export const VideoListFooter = React.memo(function VideoListFooter() {
  return (
    <View style={styles.listFooter}>
      <Text style={styles.footerText}>Videos are stored locally on your device</Text>
    </View>
  );
});
