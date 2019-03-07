import React from 'react';
import { StyleSheet, Text, View, FlatList} from 'react-native';

export default class SearchResults extends React.Component {

  _keyExtractor = (item) => item.mid;

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.infoViewer}>
          <Text style={styles.header}>Select the best description</Text>
          <FlatList
            data={this.props.data}
            renderItem={({item}) => (
              <View style={styles.result}>
                <Text style={styles.label}>{item.description}</Text>
                <Text style={styles.confidence}>{Math.floor(item.score * 10000)/100}%</Text>
              </View>
            )}
            keyExtractor={this._keyExtractor}
          ></FlatList>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    backgroundColor: 'transparent'
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
    fontSize: 16
  },
  label: {
    flex: 3,
    fontSize: 16
  }
});