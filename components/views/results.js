/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  TouchableNativeFeedback,
  Animated,
  StatusBar,
  Easing,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  infoViewer: {
    marginLeft: 5,
    marginRight: 5,
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 15,
  },
  result: {
    fontSize: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidence: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  label: {
    flex: 3,
    fontSize: 16,
  },
});

export default class SearchResults extends React.Component {
  state = {
    maxHeight: 0,
    currentHeight: 0,
    heightAnimation: new Animated.Value(),
    labelAnimation: new Animated.Value(1),
  }

  constructor(props) {
    super(props);
    this.getMaxHeight = this.getMaxHeight.bind(this);
    this.getCurrentHeight = this.getCurrentHeight.bind(this);
    this.springContainer = this.springContainer.bind(this);
  }

  getMaxHeight(evt) {
    this.setState({
      maxHeight: evt.nativeEvent.layout.height - StatusBar.currentHeight,
    });
  }

  getCurrentHeight(evt) {
    this.setState({
      currentHeight: evt.nativeEvent.layout.height,
    });
  }

  keyExtractor = item => item.mid;

  springContainer() {
    const { currentHeight, maxHeight, heightAnimation } = this.state;
    heightAnimation.setValue(currentHeight);
    this.hideLabelingResults();
    Animated.spring(
      heightAnimation,
      {
        toValue: maxHeight,
      },
    ).start();
  }

  hideLabelingResults() {
    const { labelAnimation } = this.state;
    Animated.timing(
      labelAnimation,
      {
        toValue: 0,
        duration: 500,
        easing: Easing.in(),
      },
    ).start();
  }

  render() {
    const { data, onDismiss } = this.props;
    const { heightAnimation, labelAnimation } = this.state;
    return (
      <View style={styles.container} onLayout={this.getMaxHeight}>
        <Animated.View
          style={{ ...styles.infoViewer, height: heightAnimation }}
          onLayout={this.getCurrentHeight}
        >
          <Text style={styles.header}>Select the best description</Text>
          <Animated.View style={{ opacity: labelAnimation }}>
            <FlatList
              style={{ marginBottom: 15 }}
              data={data}
              renderItem={({ item }) => (
                <TouchableNativeFeedback
                  style={{ flex: 1 }}
                  background={TouchableNativeFeedback.SelectableBackground()}
                  onPress={this.springContainer}
                >
                  <View style={styles.result}>
                    <Text style={styles.label}>{item.description}</Text>
                    <Text style={styles.confidence}>
                      {Math.floor(item.score * 10000) / 100}%
                    </Text>
                  </View>
                </TouchableNativeFeedback>
              )}
              keyExtractor={this.keyExtractor}
            />
            <Button
              title="Close"
              color="#000000"
              onPress={onDismiss}
              accessibilityLabel="Close the results and start a new recognition session"
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
}
