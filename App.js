import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Camera, Permissions, MediaLibrary } from 'expo';

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    ratio: '4:3'
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

  onSnap () {
    if (this.camera) {
      this.camera.takePictureAsync({
        base64: true,
        onPictureSaved: this.onPictureSaved
      });
    }
  }

  async onPictureSaved (photo) {
    await MediaLibrary.createAssetAsync(photo.uri);
    console.log('yee');
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
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                padding: 20,
                marginBottom: 20, 
              }}>
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
                  {' '}SNAP{' '}
                </Text>
              </TouchableOpacity>
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
