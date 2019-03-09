import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { Camera, Permissions, MediaLibrary } from 'expo';
import SearchResults from './components/views/results';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayNone: {
    display: 'none',
  },
  controls: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    padding: 20,
    marginBottom: 20,
  },
  showResults: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 10,
  },
  hidden: {
    opacity: 0,
  },
  failed: {
    color: 'red',
  },
  bottomBar: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginBottom: 20,
    marginLeft: 20,
  },
});

export default class App extends React.Component {
  state = {
    serverAccessFailed: false,
    hasCameraPermission: null,
    resultsReceived: false,
    fadeResults: new Animated.Value(0),
    type: Camera.Constants.Type.back,
    ratio: '4:3',
    labelData: [],
    loading: false,
  }

  constructor(props) {
    super(props);
    this.getCameraRatio = this.getCameraRatio.bind(this);
    this.onDismissResults = this.onDismissResults.bind(this);
    this.onSnap = this.onSnap.bind(this);
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    const fileStatus = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ hasCameraPermission: (status === 'granted' && fileStatus.status === 'granted') });
  }

  async componentDidMount() {
    const pinging = setInterval(async () => {
      try {
        const pingResponse = await fetch('https://164d5161.ngrok.io/wake'); // Call to wake server in order to see status
        const data = await pingResponse.json();
        console.log(data);
        if (data.status !== 'ok') {
          this.setState({
            serverAccessFailed: true,
          });
        } else {
          clearInterval(pinging);
        }
      } catch (e) {
        this.setState({
          serverAccessFailed: true,
        });
      }
    }, 5000);
  }

  onDismissResults() {
    const { fadeResults } = this.state;
    Animated.timing(
      fadeResults,
      {
        toValue: 0,
        duration: 500,
      },
    ).start(() => {
      this.setState({
        resultsReceived: false,
        loading: false,
        fadeResults: new Animated.Value(0),
      });
      this.camera.resumePreview();
    });
  }

  async onSnap() {
    if (this.camera) {
      // Get Photo (async)
      const photo = await this.camera.takePictureAsync({
        base64: true,
        quality: 0.6,
      });

      // UI manipulation
      this.camera.pausePreview();
      this.setState({
        loading: true,
      });

      // Send photo to be processed as base64
      await fetch('https://164d5161.ngrok.io/food-labels', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base64: photo.base64,
          dimensions: {
            height: photo.height,
            width: photo.width,
          },
        }),
      })
        .then(response => response.json())
        .then((json) => {
          console.log(json);
          const { fadeResults } = this.state;
          this.setState({
            resultsReceived: true,
            labelData: json.labelAnnotations,
          });
          Animated.timing(
            fadeResults,
            {
              toValue: 1,
              duration: 500,
            },
          ).start();
          MediaLibrary.createAssetAsync(photo.uri);
        }).catch((reason) => {
          console.log(reason);
          this.camera.resumePreview();
        });
    }
  }

  async getCameraRatio() {
    if (Platform.OS === 'android' && this.camera) {
      const ratios = await this.camera.getSupportedRatiosAsync();
      const ratio = ratios.find(r => r === '19:9') || ratios[ratios.length - 2];
      this.setState({
        ratio,
      });
    }
  }

  render() {
    const { hasCameraPermission, serverAccessFailed } = this.state;
    if (serverAccessFailed) {
      return (
        <View style={styles.container}>
          <Text style={styles.failed}>Failed to contact server.</Text>
        </View>
      );
    }
    if (hasCameraPermission === null) {
      return (
        <View style={styles.container}>
          <Text>Loading Camera Permission...</Text>
        </View>
      );
    }
    if (hasCameraPermission === false) {
      return (
        <View style={styles.container}>
          <Text style={styles.failed}>Failed to gain Permission.</Text>
        </View>
      );
    }

    const {
      type,
      ratio,
      fadeResults,
      labelData,
      resultsReceived,
      loading,
    } = this.state;

    return (
      <View style={{ flex: 1 }}>
        <Camera
          style={{ flex: 1, justifyContent: 'space-between' }}
          type={type}
          ratio={ratio}
          onCameraReady={this.getCameraRatio}
          ref={(ref) => { this.camera = ref; }}
        >
          <View style={{ flex: 1 }}>
            <Animated.View style={{ flex: 1, opacity: fadeResults }}>
              <SearchResults data={labelData} onDismiss={this.onDismissResults} />
            </Animated.View>
            <View style={resultsReceived ? styles.displayNone : styles.controls}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}
                disabled={loading}
              >
                <Text
                  style={{
                    fontSize: 25,
                    color: 'white',
                  }}
                >
                  {' '}
                  Flip
                  {' '}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 2,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={this.onSnap}
                disabled={loading}
              >
                <Text
                  style={{
                    fontSize: 25,
                    color: 'white',
                  }}
                >
                  {' '}
                  {loading ? 'LOADING' : 'RECOGNIZE'}
                  {' '}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </View>
    );
  }
}
