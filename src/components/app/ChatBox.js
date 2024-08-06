import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { animateScroll } from "react-scroll";
import ReactDOM from "react-dom";
import Modal from 'react-modal';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import './ChatBox.css';


const ChatBox = () => {

  const [formData, setFormData] = useState({
    topic: '',
    background: 'absolute beginner',
    studyMaterials: [],
    duration: { months: 0, weeks: 0, days: 0 },
    availableTime: 0,
  });

  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hello! Please provide the following details:', isForm: true }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(true); 
  const [responsePlan, setResponsePlan] = useState(''); 
  const [infoInput, setInfoInput] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false); // State for modal visibility
  const [resourcesModalIsOpen, setResourcesModalIsOpen] = useState(false); // State for resources modal visibility
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    animateScroll.scrollToBottom({
        containerId: 'messagesContainer',
        duration: 300, // Duration of the scroll animation
        smooth: true   
      });
  }, [messages]);
  
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        if (isFormVisible) {
          handleFormSubmit();
        } else if (userInput.trim()!=='') {
          handleUserInputSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [messages, formData, userInput, isFormVisible]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        studyMaterials: checked
          ? [...prev.studyMaterials, value]
          : prev.studyMaterials.filter((material) => material !== value)
      }));
    } else if (['months', 'weeks', 'days'].includes(name)) {
      setFormData((prev) => ({
        ...prev,
        duration: { ...prev.duration, [name]: Number(value) },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async () => {
    const { topic, background, studyMaterials, duration, availableTime } = formData;
    const userMessage = `Create a study plan for a ${background} student on ${topic} using ${studyMaterials.join(', ')} over ${duration.months} months, ${duration.weeks} weeks, and ${duration.days} days with ${availableTime} hours available per week.`;
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', text: userMessage }
    ]);

    try {
      const response = await axios.post('http://localhost:1350/response', { user_message: userMessage });
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: response.data.response, isForm: false }
      ]);
      setIsFormVisible(false);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Error fetching response from OpenAI.', isForm: false }
      ]);
    }
  };

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleUserInputSubmit = async () => {
    if (userInput.trim() === '') return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: 'user', text: userInput },
    ]);
    setUserInput('');
    try {
      const response = await axios.post('http://localhost:1350/response', { user_message: userInput });
      setResponsePlan(response.data.response);
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: response.data.response, isForm: false },
      ]);
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: 'bot', text: 'Error fetching response from OpenAI.', isForm: false },
      ]);
    }
  };

  const handleInfoClick = async () => {
    const infoMessage = `Can you explain more about the background knowledge levels for the topic: ${formData.topic}?`;
    try {
      if(formData.topic){
        const response = await axios.post('http://localhost:1350/info', { info_message: infoMessage });
        setInfoInput(response.data.response);
        setModalIsOpen(true);
      }
      else{
        alert('Please input topic first');
      }

    } catch (error) {
      alert('Error fetching response from OpenAI');
    }
  };

  const handleResourcesClick = async () => {
    if (!formData.topic) {
      alert('Please input a topic first');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:1350/search', { search_message: formData.topic });
      console.log('API Response:', response.data); 

      const items = response.data.response.items || [];
      console.log('Extracted Items Array:', items);

      // Map through the items to extract and format the necessary information
      const formattedResults = items.map(item => ({
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`, // Construct URL from videoId
        thumbnail: item.snippet.thumbnails.default.url, // Default thumbnail
        title: item.snippet.title,
        description: item.snippet.description,
      }));

      console.log('Formatted Results:', formattedResults);

      if (formattedResults.length === 0) {
        setSearchResults([{ title: 'No resources found', description: '', url: '', thumbnail: '' }]);
      } else {
        setSearchResults(formattedResults);
      }
      setResourcesModalIsOpen(true);
    } catch (error) {
      alert('Error fetching additional resources');
      console.error('API Error:', error);
    }
  };
  

  const closeModal = () => setModalIsOpen(false);
  const closeResourcesModal = () => setResourcesModalIsOpen(false);


  return (
    <div style={styles.container}>
      <div id="messagesContainer" style={styles.messages}>
        {messages.map((message, index) => (
          <div key={index} style={message.type === 'user' ? styles.userMessage : styles.botMessage}>
            {message.isForm ? (
              <Form
                formData={formData}
                handleInputChange={handleInputChange}
                handleFormSubmit={handleFormSubmit}
                handleInfoClick={handleInfoClick}
                handleResourcesClick={handleResourcesClick}
              />
            ) : (
              <>
              <div style={styles.botMessageContent}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
                {message.type === 'bot' && !isFormVisible && (
                  <button 
                    onClick={handleResourcesClick} 
                    style={styles.additionalResourcesButton}
                  >
                    Additional Resources
                  </button>
                )}
              </div>
              </>
            )}
          </div>
        ))}
      </div>
      {!isFormVisible && (<div style={styles.userInputContainer}>
        <input
          type="text"
          placeholder="Type here..."
          value={userInput}
          onChange={handleUserInputChange}
          style={styles.userInput}
        />
        <button onClick={handleUserInputSubmit} style={styles.sendButton}>Send</button>
      </div>)}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Markdown Info"
        style={styles.modal}
      >
        <button onClick={closeModal} style={styles.closeButton}>Close</button>
        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{infoInput}</ReactMarkdown>         
      </Modal>

      <Modal
        isOpen={resourcesModalIsOpen}
        onRequestClose={closeResourcesModal}
        contentLabel="Additional Resources"
        style={styles.modal}
      >
        <h2>Additional Resources</h2>
        <div className="resources-container">
          {searchResults.length > 0 ? (
            searchResults.map((resource, index) => (
              <div key={index} className="result-card">
                {resource.url ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.thumbnail && <img src={resource.thumbnail} alt={resource.title} className="thumbnail" />}
                    <div className="card-content">
                      <h3>{resource.title}</h3>
                      <p>{resource.description}</p>
                    </div>
                  </a>
                ) : (
                  <div className="card-content">
                    <h3>{resource.title}</h3>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No additional resources found.</p>
          )}
        </div>
        <button onClick={closeResourcesModal} style={styles.closeButton}>Close</button>
      </Modal>
      
    </div>
  );
};

const Form = ({ formData, handleInputChange, handleFormSubmit, handleInfoClick }) => (
  <div>
    <label style={styles.label}>Please answer below questions for your study plan!</label>
    <InputGroup label="Subject:" name="topic" value={formData.topic} onChange={handleInputChange} placeholder="Enter the topic you want to study here"/>
    <InputGroup 
    label="Background Knowledge:" name="background" value={formData.background} onChange={handleInputChange} type="select" 
    options={["absolute beginner", "beginner", "intermediate", "advanced"]} 
    button={<button onClick={handleInfoClick} style={styles.button}>Info</button>}
    />
    <InputGroup label="Study Materials:" type="checkbox" options={["YouTube", "Blogs"]} selectedOptions={formData.studyMaterials} onChange={handleInputChange} />
    <InputGroup label="Duration:" type="duration" duration={formData.duration} onChange={handleInputChange} />
    <InputGroup label="Available Time in Week:" name="availableTime" value={formData.availableTime} onChange={handleInputChange} type="number" placeholder="Enter your available time to study per week"/>
    <button onClick={handleFormSubmit} style={styles.sendButton}>Submit</button>
  </div>
);

const InputGroup = ({ label, name, value, onChange, type = "text", options = [], selectedOptions = [], duration = {}, placeholder, button }) => (
  <div style={styles.inputGroup}>
    <label style={styles.label}>{label}</label> 
    {type === "select" ? (
    <div style={styles.inputWithButton}>
      <select name={name} value={value} onChange={onChange} style={styles.input}>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
      {button}
    </div>
    ) : type === "checkbox" ? (
      <div>
        {options.map((option, index) => (
          <label key={index}>
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selectedOptions.includes(option)}
              onChange={onChange}
              style={styles.checkbox}
            /> {option}
          </label>
        ))}
      </div>
    ) : type === "duration" ? (
      <div>
        {["months", "weeks", "days"].map((timeUnit, index) => (
          <label key={index}>
            <input
              type="number"
              name={timeUnit}
              placeholder={timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)}
              value={duration[timeUnit]}
              onChange={onChange}
              style={styles.input}
              min='0'
              onFocus={(e) => e.target.select()}
            /> 
            <span> {timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)} </span> 
          </label>
        ))}
      </div>
      ) : (name === "availableTime" ? (
          <div style={styles.inputWithLabel}>
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              style={styles.input}
              placeholder={placeholder}
              min='0'
            />
            <span style={styles.hoursLabel}> Hours </span>
          </div>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        style={styles.input}
        placeholder={placeholder}
        min='0'
      />
      ))}
  </div>
);

const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      border: '1px solid #ccc',
      borderRadius: '5px',
      padding: '10px',
      boxSizing: 'border-box',
    },
    messages: {
      flex: 1,
      overflowY: 'auto',
      marginBottom: '10px',
    },
    userMessage: {
      padding: '10px',
      margin: '10px 250px',
      borderRadius: '15px',
      backgroundColor: '#d1f5d3',
      alignSelf: 'flex-end',
      maxWidth: '80%',
      wordWrap: 'break-word',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      fontFamily: 'San Francisco, Arial, sans-serif',
      //textAlign: 'left',
      fontSize: '16px',
      marginRight: '1px',
      display: 'flex',
      justifyContent: 'space-between',
    },
    botMessage: {
      padding: '10px',
      borderRadius: '15px',
      backgroundColor: '#d0e7ff',
      alignSelf: 'flex-start',
      maxWidth: '80%',
      wordWrap: 'break-word',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      fontFamily: 'San Francisco, Arial, sans-serif',
      fontSize: '16px',
      marginRight: 'auto',
      justifyContent: 'space-between',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '20px',
    },
    label: {
        display: 'block',
        fontSize: '15px', 
        fontWeight: 'bold',
        marginBottom: '10px',
      },
    label1:{
        display: 'block',
        fontSize: '15px', 
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '10px',
        textAlign: 'left',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f0f8ff',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        whiteSpace: 'nowrap',
      },
    input: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      marginTop: '10px',
    },
    userInputContainer: {
      display: 'flex',
      alignItems: 'center',
      borderTop: '1px solid #ccc',
      padding: '10px 0',
    },
    userInput: {
      display: 'right',
      flex: 1,
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      fontFamily: 'San Francisco, Arial, sans-serif',
      fontSize: '16px',
    },
    sendButton: {
      padding: '10px 20px',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      marginLeft: '10px',
      fontFamily: 'San Francisco, Arial, sans-serif',
      fontSize: '16px',
      alignItems: 'center',
    },
    botButton: {
      padding: '5px 10px',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      fontFamily: 'San Francisco, Arial, sans-serif',
      fontSize: '14px',
      marginLeft: '10px',
    },
    inputWithButton: { 
      display: 'flex', 
      alignItems: 'center' 
    },
    button: {
      padding: '5px 5px',
      marginLeft: '10px',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      alignSelf: 'center',
      marginTop: '5px',
      fontFamily: 'San Francisco, Arial, sans-serif',
      fontSize: '13px',
    },
    additionalResourcesButton: {
      padding: '10px 20px',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: '#28a745',
      color: '#fff',
      cursor: 'pointer',
      marginTop: '10px',
      fontFamily: 'San Francisco, Arial, sans-serif',
      fontSize: '14px',
    },
    modal: {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '600px',
        width: '90%',
        borderRadius: '10px',
        padding: '20px',
      },
    },
    botMessageContent: {
      display: 'flex',
      flexDirection: 'column',
    },
    resultsContainer: {
      display: 'flex',
      flexDirection: 'column',
    },
    resultCard: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: '10px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
    thumbnail: {
      width: '50px',
      height: '50px',
      marginRight: '10px',
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
    },
  };
export default ChatBox;
