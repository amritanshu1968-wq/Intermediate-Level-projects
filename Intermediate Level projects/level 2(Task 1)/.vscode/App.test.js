import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Home page', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /Home Page/i });
  expect(heading).toBeInTheDocument();
});
