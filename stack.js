import { createAppContainer, createSwitchNavigator} from 'react-navigation';
// importing screens
import Home from './home';
import GetStarted from './GetStarted';

const SwitchNavigator = createSwitchNavigator({
    GetStartedScreen: GetStarted,
    HomeScreen: Home    
});
export default createAppContainer(SwitchNavigator);