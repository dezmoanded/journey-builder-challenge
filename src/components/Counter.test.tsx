import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Counter } from './Counter'

it('increments count', async () => {
  render(<Counter />)
  const btn = screen.getByRole('button', { name: /count/i })
  await userEvent.click(btn)
  expect(btn).toHaveTextContent('Count: 1')
})
