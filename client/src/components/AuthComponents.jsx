import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

function LoginForm(props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (event) => {
      event.preventDefault();
      const credentials = { username, password };
      
      props.login(credentials);
  };

  return (
    <Form onSubmit={handleSubmit} className='m-auto d-flex flex-column align-items-center'>
      <Form.Group controlId='username' className='mt-2 w-75'>
          <Form.Label>Username</Form.Label>
          <Form.Control type='email' value={username} placeholder='sample@polito.it' onChange={ev => setUsername(ev.target.value)} required={true} />
      </Form.Group>

      <Form.Group controlId='password' className='mt-2 w-75'>
          <Form.Label>Password</Form.Label>
          <Form.Control type='password' value={password} placeholder='********' onChange={ev => setPassword(ev.target.value)} required={true} minLength={6}/>
      </Form.Group>

      <Button variant='secondary' className='mt-3' type="submit">Login</Button>
  </Form>
  )
};

export { LoginForm };