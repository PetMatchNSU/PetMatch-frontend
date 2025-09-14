import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../store/exampleSlice';
import { fetchHello, selectHelloResponse, selectHelloLoading, selectHelloError } from '../store/helloSlice';
import type { RootState, AppDispatch } from '../store';
import ExampleForm from '../components/ExampleForm';

const Home: React.FC = () => {
  const count = useSelector((state: RootState) => state.example.value);
  const helloResponse = useSelector(selectHelloResponse);
  const loading = useSelector(selectHelloLoading);
  const error = useSelector(selectHelloError);
  const dispatch: AppDispatch = useDispatch();

  const handleHelloClick = () => {
    dispatch(fetchHello());
  };

  return (
    <div>
      <h1>Welcome to PetMatch</h1>
      <p>Find your perfect pet companion!</p>
      
      {/* Hello Button Section */}
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Hello API Test</h5>
          <button
            className="btn btn-primary"
            onClick={handleHelloClick}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'hello'}
          </button>
          
          {helloResponse && (
            <div className="mt-3">
              <h6>Response:</h6>
              <pre>{helloResponse}</pre>
            </div>
          )}
          
          {error && (
            <div className="mt-3 alert alert-danger">
              Error: {error}
            </div>
          )}
        </div>
      </div>
      
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Counter Example</h5>
          <p className="card-text">Count: {count}</p>
          <button className="btn btn-primary me-2" onClick={() => dispatch(increment())}>
            Increment
          </button>
          <button className="btn btn-secondary" onClick={() => dispatch(decrement())}>
            Decrement
          </button>
        </div>
      </div>
      
      <ExampleForm />
    </div>
  );
};

export default Home;