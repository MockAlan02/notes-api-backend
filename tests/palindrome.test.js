const { palindrome } = require('../utils/for_testing')

test('palindrome of alan', () => {
  const result = palindrome('midudev')

  expect(result).toBe('vedudim')
})

test('palindrome of empty string', () => {
  const result = palindrome('')
  expect(result).toBe('')
})
