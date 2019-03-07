import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Animated } from 'react-native';
import { Camera, Permissions, MediaLibrary } from 'expo';
import SearchResults from './components/views/results';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    resultsReceived: false,
    fadeResults: new Animated.Value(0),
    type: Camera.Constants.Type.back,
    ratio: '4:3',
    labelData: []
  }

  constructor(props) {
    super(props);
    this.getCameraRatio = this.getCameraRatio.bind(this);
    this.onSnap = this.onSnap.bind(this);
  }

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    const fileStatus = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({hasCameraPermission: (status === 'granted' && fileStatus.status === 'granted')});
  }

  componentDidMount() {
  }

  async onSnap () {
    if (this.camera) {
      const photo = await this.camera.takePictureAsync({
        base64: true,
        quality: 0.6
      });
      this.camera.pausePreview();
      console.log(`photo: ${photo.uri}`)
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
            width: photo.width
          }
        })
      })
      .then((response) => response.json())
      .then((json) => {
        console.log(json)
        this.setState({
          resultsReceived: true,
          labelData: json.labelAnnotations
        });
        Animated.timing(
          this.state.fadeResults,
          {
            toValue: 1,
            duration: 1000,
          }
        ).start();
        // this.camera.resumePreview();
        MediaLibrary.createAssetAsync(photo.uri);
      }).catch((reason) => {
        console.log(reason);
        // this.camera.resumePreview();
      });
    }
  }

  async getCameraRatio() {
    if (Platform.OS === 'android' && this.camera) {
      const ratios = await this.camera.getSupportedRatiosAsync();
      const ratio = ratios.find((ratio) => ratio === '19:9') || ratios[ratios.length - 2];
      this.setState({
        ratio: ratio
      });
    }
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return (
        <View style={styles.container}>
          <Text>Loading Camera Permission...</Text>
        </View>
      )
    } else if (!hasCameraPermission) {
      return (
        <View style={styles.container}>
          <Text style={styles.failed}>Failed to gain Permission.</Text>
        </View>
      )
    } else {
      return (
        <View style={{flex: 1}}>
          <Camera 
            style={{ flex: 1, justifyContent: 'space-between'}} 
            type={this.state.type} 
            ratio={this.state.ratio} 
            onCameraReady={this.getCameraRatio}
            ref={ref => {this.camera = ref}}>
              <View style={{ flex: 1 }}>
                <Animated.View style={{ flex: 1, opacity: this.state.fadeResults}}>
                  <SearchResults data={this.state.labelData}/>
                </Animated.View>
                <View style={this.state.resultsReceived ? styles.displayNone : styles.controls}>
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      alignSelf: 'flex-end',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      this.setState({
                        type: this.state.type === Camera.Constants.Type.back 
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back,
                      })
                    }}>
                    <Text style={{
                      fontSize: 25,
                      color: 'white',
                    }}>
                      {' '}Flip{' '}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      flex: 2,
                      alignSelf: 'flex-end',
                      alignItems: 'center',
                    }}
                    onPress={this.onSnap}>
                    <Text style={{
                      fontSize: 25,
                      color: 'white',
                    }}>
                      {' '}RECOGNIZE{' '}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
          </Camera>
          
        </View>
      )
    }
  }
}

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
    opacity: 0
  },
  failed: {
    color: 'red'
  },
  bottomBar: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    marginBottom: 20, 
    marginLeft: 20,
  }
});
