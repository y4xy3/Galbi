import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useColors from '../../hooks/useColors';

// Path to the uploaded image
const backgroundImage = require('../../../assets/Galbi.jpeg');
const overlayImage = require('../../../assets/Text.png');

const WelcomeSlide = ({ onStart }: { onStart: () => void }) => {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ImageBackground source={backgroundImage} style={styles.backgroundImage} imageStyle={styles.image}>
      <ImageBackground source={overlayImage} style={styles.overlayImage} imageStyle={styles.overlay} />
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity style={[styles.button, { backgroundColor: colors.miniButtonBackground }]} onPress={onStart}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  overlayImage: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 100,
    width: '80%',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default WelcomeSlide;
