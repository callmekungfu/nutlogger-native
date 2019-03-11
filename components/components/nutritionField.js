/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import {
  View,
  Text,
} from 'react-native';

const NutritionField = (props) => {
  const { data, title, fontSize } = props;
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <Text style={{ fontSize }}>{title}:</Text>
      <Text style={{ fontSize }}>{data}</Text>
    </View>
  );
};

export default NutritionField;
