import React, {useState} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';


const CustomMarkdown = ({ markdownText }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [resourcesModalIsOpen, setResourcesModalIsOpen] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState('');

    let data;

    // Attempt to parse JSON
    try {
        data = JSON.parse(markdownText);
    } catch (error) {
        // Handle parsing error: Render plain text if JSON parsing fails
        return (
            <div>
                <ReactMarkdown>{markdownText}</ReactMarkdown>
            </div>
        );
    }

    const checkResourceAvailability = async (link) => {
        try {
            const response = await axios.get('http://localhost:1350/check', { params: { url: link } });
            return response.data.isAvailable;
        } catch (error) {
            console.error('Error checking resource availability:', error);
            return false;
        }
    };

    const handleResourcesClick = async (topic, type) => {
        // Only make API call if the resource type is 'YouTube'
        if (type === 'YouTube') {
            if (!topic) {
                alert('Please provide a topic');
                return;
            }

            try {
                const response = await axios.post('http://localhost:1350/search', { search_message: topic });
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
        } else { // Resource type == 'Blog'
            alert('Resource type is not supported for API requests');
        }
    };

    const renderResources = (resources, topic) => {
        if (typeof resources === 'object' && resources !== null) {
            return Object.keys(resources).map((type, index) => {
                const resource = resources[type];
                return (
                    <div key={index} style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h4 style={{ fontSize: '1rem', marginLeft: '0.5rem', marginRight: '0.5rem' }}>{type}</h4>
                            {/* Show button only if resource type is 'YouTube' */}
                            <button onClick={() => handleResourcesClick(topic, type)} style={{ fontSize: '1rem'}}>🎦 Additional Resources</button>
                        </div>
                        <p style={{ fontSize: '1rem', marginLeft: '1rem' }}><strong>Title:</strong> {resource.title}</p>
                        <p style={{ fontSize: '1rem', marginLeft: '1rem' }}><strong>Link:</strong> <a href={resource.link} target="_blank" rel="noopener noreferrer">{resource.link}</a></p>
                    </div>
                );
            });
        } else {
            // Handle non-object resources
            return <p>No resources available</p>;
        }
    };

    const renderStudyPlan = (plan) => {
        return Object.keys(plan).map(week => (
            <div key={week}>
                <h3>{week}</h3>
                {plan[week].map((entry, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>[{entry.day}]</p> {/* Larger Day Text */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <p style={{ fontSize: '1rem', fontWeight: 'bold', marginRight: '0.5rem', marginLeft: '0.5rem' }}>Topic:</p>
                            <button onClick={() => handleResourcesClick(entry.topic, 'YouTube')}>{entry.topic}</button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ marginTop: '0.5rem' }}>
                                {renderResources(entry.resources, entry.topic)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ));
    };

    return (
        <div>
            <h2>Study Plan Overview</h2>
            {Object.keys(data.studyPlan_Overview).map(week => (
                <div key={week} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 1rem 0 0' }}>{week}:</h3>
                    <p style={{ margin: 0 }}>{data.studyPlan_Overview[week]}</p>
                </div>
            ))}
            <br />
            <h2>Detailed Study Plan</h2>
            {renderStudyPlan(data.studyPlan)}

            {/* Modal for displaying search results */}
            {resourcesModalIsOpen && (
                <div style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', maxWidth: '600px', width: '100%', height: '750px', display: 'flex', flexDirection: 'column' }}>
                        <h3>Additional Resources</h3>
                        <div style={{ flex: '1', overflowY: 'auto', marginTop: '1rem' }}>
                            {searchResults.map((result, index) => (
                                <div key={index} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                                    <img src={result.thumbnail} alt={result.title} style={{ width: '120px', height: '90px', marginRight: '1rem' }} />
                                    <div>
                                        <a href={result.url} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{result.title}</a>
                                        <p>{result.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setResourcesModalIsOpen(false)} style={{ float: 'right' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomMarkdown;