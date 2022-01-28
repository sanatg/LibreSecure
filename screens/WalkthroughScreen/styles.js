import { StyleSheet } from 'react-native';

const dynamicStyles = (appStyles, colorScheme) => {
  return StyleSheet.create({
    title: {
      fontSize: 25,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingBottom: 25,
      color: '#91A1BD',
    },
    text: {
      fontSize: 18,
      textAlign: 'center',
      color: '#91A1BD',
      paddingLeft: 10,
      paddingRight: 10,
    },
    image: {
      width: 100,
      height: 100,
      marginBottom: 60,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#DEE9FD',
    },
    button: {
      fontSize: 18,
      color: '#91A1BD',
      marginTop: 10,
    },

  });
};

export default dynamicStyles;
