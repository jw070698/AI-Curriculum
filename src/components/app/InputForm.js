import React from 'react';

const InputForm = ({ formData, handleInputChange, handleFormSubmit, handleInfoClick }) => (
  <div>
    <label style={styles.label}>Please answer the questions below for your study plan!</label>
    <InputGroup 
      label="Subject:" 
      name="topic" 
      value={formData.topic} 
      onChange={handleInputChange} 
      placeholder="Enter the topic you want to study here"
    />
    <InputGroup 
      label="Background Knowledge:" 
      name="background" 
      value={formData.background} 
      onChange={handleInputChange} 
      type="select" 
      options={["absolute beginner", "beginner", "intermediate", "advanced"]} 
      button={<button onClick={handleInfoClick} style={styles.button}>Info</button>}
    />
    <InputGroup 
      label="Study Materials:" 
      type="checkbox" 
      options={["YouTube", "Blogs"]} 
      selectedOptions={formData.studyMaterials} 
      onChange={handleInputChange} 
    />
    <InputGroup 
      label="Duration:" 
      type="duration" 
      duration={formData.duration} 
      onChange={handleInputChange} 
    />
    <InputGroup 
      label="Available Time in Week:" 
      name="availableTime" 
      value={formData.availableTime} 
      onChange={handleInputChange} 
      type="number" 
      placeholder="Enter your available time to study per week"
    />
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
              style={styles.checkbox} // Ensure this style exists if needed
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
              value={duration[timeUnit] || ''}
              onChange={onChange}
              style={styles.input}
              min='0'
              onFocus={(e) => e.target.select()}
            />
            <span> {timeUnit.charAt(0).toUpperCase() + timeUnit.slice(1)} </span>
          </label>
        ))}
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
    )}
  </div>
);

const styles = {
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
    input: {
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
      marginTop: '10px',
    },
    inputWithButton: {
      display: 'flex',
      alignItems: 'center',
    },
    button: {
      padding: '5px 10px',
      marginLeft: '10px',
      borderRadius: '5px',
      border: 'none',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      fontFamily: 'San Francisco, Arial, sans-serif',
      fontSize: '13px',
      alignSelf: 'center',
      marginTop: '5px',
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
    },
    checkbox: {
      marginRight: '5px',
    },
};

export default InputForm;
