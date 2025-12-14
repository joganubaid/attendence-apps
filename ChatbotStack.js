// ChatbotStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Chatbot from './Chatbot';
import PdfViewer from './PdfViewer'; // Put PdfViewer.js in same folder

const Stack = createNativeStackNavigator();

export default function ChatbotStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ChatbotHome" component={Chatbot} options={{ title: "Chatbot" }} />
      <Stack.Screen name="PdfViewer" component={PdfViewer}  options={{ title: "PDF Viewer" }} />
    </Stack.Navigator>
  );
}
