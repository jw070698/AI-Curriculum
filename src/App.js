import logo from './logo.svg';
import React from 'react';
import ChatBox from './components/app/ChatBox';

function App() {
  return (
    <div style={styles.container}>
      <ChatBox />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
};

export default App;
