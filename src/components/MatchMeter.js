import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text } from 'react-native';

export default function MatchMeter({ value, style }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    anim.setValue(0);
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));

    Animated.timing(anim, {
      toValue: value,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // precisa ser false pra ler o valor no listener
    }).start();

    return () => anim.removeListener(id);
  }, [value]);

  return <Text style={style}>{display}% MATCH</Text>;
}