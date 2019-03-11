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
  ScrollView,
  StatusBar,
  Easing,
  Image,
  TextInput,
  Picker,
} from 'react-native';
import NutritionField from '../components/nutritionField';

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
  searchResults: {
    fontSize: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  nutritionHeader: {
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default class SearchResults extends React.Component {
  static capitalize(name) {
    if (name) {
      return name.replace(/^\w/, c => c.toUpperCase());
    }
    return name;
  }

  state = {
    maxHeight: 0,
    currentHeight: 0,
    showLabeling: true,
    showSearchResults: false,
    showNutrition: false,
    nutritionData: null,
    nutritionPage: {
      name: null,
      picture: null,
      quantity: '1',
      unit: 'grams',
    },
    searchResults: [],
    heightAnimation: new Animated.Value(),
    labelAnimation: new Animated.Value(1),
  }

  constructor(props) {
    super(props);
    this.getMaxHeight = this.getMaxHeight.bind(this);
    this.getCurrentHeight = this.getCurrentHeight.bind(this);
    this.onLabelResultPress = this.onLabelResultPress.bind(this);
    this.springContainer = this.springContainer.bind(this);
    this.onSearchResultPress = this.onSearchResultPress.bind(this);
    this.onChangeQuantity = this.onChangeQuantity.bind(this);
    this.getNutritionData = this.getNutritionData.bind(this);
    this.onChangeUnit = this.onChangeUnit.bind(this);
  }

  async onLabelResultPress(label) {
    const encoded = encodeURI(`https://164d5161.ngrok.io/food/${label}`);
    fetch(encoded, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(res => res.json())
      .then((json) => {
        this.setState({
          searchResults: json,
        });
      });
    this.springContainer();
  }

  onSearchResultPress(name, picture, unit) {
    const { nutritionPage } = this.state;
    const nutritionPageCopy = JSON.parse(JSON.stringify(nutritionPage));
    nutritionPageCopy.name = name;
    nutritionPageCopy.picture = picture;
    nutritionPageCopy.unit = unit;
    this.setState({
      nutritionPage: nutritionPageCopy,
      showNutrition: true,
      showSearchResults: false,
    });
  }

  onChangeQuantity(value) {
    const { nutritionPage } = this.state;
    const nutritionPageCopy = JSON.parse(JSON.stringify(nutritionPage));
    nutritionPageCopy.quantity = value;
    this.setState({
      nutritionPage: nutritionPageCopy,
    });
  }

  onChangeUnit(value) {
    const { nutritionPage } = this.state;
    const nutritionPageCopy = JSON.parse(JSON.stringify(nutritionPage));
    nutritionPageCopy.unit = value;
    this.setState({
      nutritionPage: nutritionPageCopy,
    }, () => {
      this.getNutritionData();
    });
  }

  async getNutritionData() {
    const { nutritionPage } = this.state;
    const query = `${nutritionPage.quantity} ${nutritionPage.unit} ${nutritionPage.name}`;
    try {
      const response = await fetch('https://164d5161.ngrok.io/food', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
        }),
      });
      const json = await response.json();
      console.log(json);
      this.setState({
        nutritionData: json,
      });
    } catch (error) {
      console.log('Error:', error);
    }
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

  keyExtractorSearchResults = item => item.food_name;

  springContainer() {
    const { currentHeight, maxHeight, heightAnimation } = this.state;
    heightAnimation.setValue(currentHeight);
    this.hideLabelingResults();
    this.setState({
      showSearchResults: true,
    });
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
    ).start(() => {
      this.setState({
        showLabeling: false,
      });
    });
  }

  renderTitle() {
    const {
      showLabeling,
      showNutrition,
      showSearchResults,
    } = this.state;
    if (showLabeling) {
      return 'Found These Labels';
    } if (showSearchResults) {
      return 'Search Results';
    } if (showNutrition) {
      return 'Nutrition Info';
    }
    return '';
  }

  render() {
    const { data, onDismiss } = this.props;
    const {
      heightAnimation,
      labelAnimation,
      showSearchResults,
      searchResults,
      showLabeling,
      nutritionPage,
      nutritionData,
    } = this.state;
    return (
      <View style={styles.container} onLayout={this.getMaxHeight}>
        <Animated.View
          style={{ ...styles.infoViewer, height: heightAnimation }}
          onLayout={this.getCurrentHeight}
        >
          <Text style={styles.header}>
            {this.renderTitle()}
          </Text>
          {showLabeling ? (
            <Animated.View style={{ opacity: labelAnimation }}>
              <FlatList
                style={{ marginBottom: 15 }}
                data={data}
                renderItem={({ item }) => (
                  <TouchableNativeFeedback
                    style={{ flex: 1 }}
                    background={TouchableNativeFeedback.SelectableBackground()}
                    onPress={() => this.onLabelResultPress(item.description)}
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
          ) : null
          }
          {showSearchResults ? (
            <Animated.ScrollView>
              <FlatList
                data={searchResults}
                keyExtractor={this.keyExtractorSearchResults}
                renderItem={({ item }) => (
                  <TouchableNativeFeedback
                    style={{ height: 100 }}
                    background={TouchableNativeFeedback.SelectableBackground()}
                    onPress={() => this.onSearchResultPress(
                      item.food_name,
                      item.photo.thumb,
                      item.serving_unit,
                    )}
                  >
                    <View style={styles.searchResults}>
                      <View style={{ width: 100, height: 100, marginRight: 15 }}>
                        <Image source={{ uri: item.photo.thumb }} style={{ flex: 1 }} />
                      </View>
                      <View style={{ flex: 3 }}>
                        <Text style={{ fontSize: 20 }}>
                          {SearchResults.capitalize(item.food_name)}
                        </Text>
                        <Text>{item.serving_qty} {item.serving_unit}</Text>
                      </View>
                    </View>
                  </TouchableNativeFeedback>
                )}
              />
            </Animated.ScrollView>
          ) : null
          }
          <Animated.ScrollView>
            <View style={styles.nutritionHeader}>
              <Image
                source={{ uri: nutritionPage.picture }}
                style={{ width: 100, height: 100, marginBottom: 15 }}
              />
              <Text style={{ fontSize: 22 }}>{SearchResults.capitalize(nutritionPage.name)}</Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TextInput
                  style={{
                    height: 50,
                    textAlign:
                    'center',
                    fontSize: 18,
                    width: 50,
                  }}
                  maxLength={10}
                  placeholder="Quantity"
                  multiline={false}
                  returnKeyLabel="done"
                  keyboardType="numeric"
                  underlineColorAndroid="#000000"
                  onChangeText={this.onChangeQuantity}
                  onSubmitEditing={this.getNutritionData}
                />
                <Picker
                  style={{ height: 50, width: 150 }}
                  mode="dialog"
                  prompt="Select Unit"
                  selectedValue={nutritionPage.unit}
                  onValueChange={this.onChangeUnit}
                >
                  <Picker.Item label="Grams" value="grams" />
                  <Picker.Item label="Cups" value="cup" />
                  <Picker.Item label="Pound" value="pound" />
                </Picker>
              </View>
            </View>
            {nutritionData ? (
              <ScrollView>
                <NutritionField data={nutritionData.foods[0].nf_calories} title="Calories" fontSize={20} />
                <NutritionField data={nutritionData.foods[0].nf_total_fat} title="Total Fat" fontSize={16} />
                <NutritionField data={nutritionData.foods[0].nf_total_carbohydrate} title="Carbohydrate" fontSize={16} />
              </ScrollView>
            ) : null}
          </Animated.ScrollView>
        </Animated.View>
      </View>
    );
  }
}
