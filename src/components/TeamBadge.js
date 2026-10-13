import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import colors from '../utils/colors';
import { initials, withAlpha } from '../utils/helpers';
import { resolveLocalUri } from '../utils/imageStorage';

// Shows a remote/local logo, or a colored circle with initials as a fallback
const TeamBadge = ({ uri, name, color = colors.primary, size = 40 }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [uri]);

  if (uri && !failed) {
    return (
      <Image
        source={{ uri: resolveLocalUri(uri) }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: withAlpha(color, 0.18),
          borderColor: color,
        },
      ]}
    >
      <Text style={[styles.text, { color, fontSize: size * 0.36 }]}>{initials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  text: {
    fontWeight: '800',
  },
});

export default TeamBadge;
