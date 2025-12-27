
import { Question } from '../types';

export const GRADE_3_QUESTIONS: Question[] = [
  // --- MATHEMATICS (1-15) ---
  {
    id: 'g3-math-1',
    text: 'What is the value of the digit 5 in the number 53?',
    options: ['5', '50', '3', '53'],
    correctAnswer: 1, // 50
    difficulty: 2,
    skill: 'Place Value',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-2',
    text: 'Which number comes next in the pattern: 2, 4, 6, 8, __?',
    options: ['9', '10', '12', '11'],
    correctAnswer: 1, // 10
    difficulty: 2,
    skill: 'Patterns',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-3',
    text: 'Rahul has 12 apples. He gives 4 apples to his sister. How many does he have left?',
    options: ['16', '10', '8', '6'],
    correctAnswer: 2, // 8
    difficulty: 2,
    skill: 'Subtraction',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-4',
    text: 'Which shape has 3 corners?',
    options: ['Square', 'Circle', 'Triangle', 'Rectangle'],
    correctAnswer: 2, // Triangle
    difficulty: 1,
    skill: 'Geometry',
    grade: '3',
    subject: 'Math',
    damage: 15
  },
  {
    id: 'g3-math-5',
    text: 'What is 15 + 8?',
    options: ['22', '23', '24', '20'],
    correctAnswer: 1, // 23
    difficulty: 2,
    skill: 'Addition',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-6',
    text: 'Which object is the heaviest?',
    options: ['A feather', 'A pencil', 'A car', 'A shoe'],
    correctAnswer: 2, // A car
    difficulty: 1,
    skill: 'Measurement',
    grade: '3',
    subject: 'Math',
    damage: 15
  },
  {
    id: 'g3-math-7',
    text: 'Identify the smallest number.',
    options: ['98', '23', '101', '45'],
    correctAnswer: 1, // 23
    difficulty: 2,
    skill: 'Comparing Numbers',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-8',
    text: 'If today is Monday, what day will it be tomorrow?',
    options: ['Sunday', 'Tuesday', 'Wednesday', 'Friday'],
    correctAnswer: 1, // Tuesday
    difficulty: 1,
    skill: 'Time',
    grade: '3',
    subject: 'Math',
    damage: 15
  },
  {
    id: 'g3-math-9',
    text: 'How many centimeters are on a standard small ruler?',
    options: ['100 cm', '15 cm', '5 cm', '50 cm'],
    correctAnswer: 1, // 15 cm
    difficulty: 2,
    skill: 'Measurement',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-10',
    text: 'Which is the correct way to write "Forty-Two"?',
    options: ['402', '42', '24', '4002'],
    correctAnswer: 1, // 42
    difficulty: 1,
    skill: 'Number Words',
    grade: '3',
    subject: 'Math',
    damage: 15
  },
  {
    id: 'g3-math-11',
    text: 'I have 3 coins of 5. How much money do I have?',
    options: ['10', '8', '15', '20'],
    correctAnswer: 2, // 15
    difficulty: 3,
    skill: 'Money',
    grade: '3',
    subject: 'Math',
    damage: 25
  },
  {
    id: 'g3-math-12',
    text: 'Which clock shows 3:00?',
    options: ['Small hand on 12, Big hand on 3', 'Small hand on 3, Big hand on 12', 'Both hands on 3', 'Small hand on 3, Big hand on 6'],
    correctAnswer: 1, // Small hand on 3, Big hand on 12
    difficulty: 2,
    skill: 'Time',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-13',
    text: 'Which number is an Odd number?',
    options: ['2', '4', '7', '10'],
    correctAnswer: 2, // 7
    difficulty: 2,
    skill: 'Even/Odd',
    grade: '3',
    subject: 'Math',
    damage: 20
  },
  {
    id: 'g3-math-14',
    text: 'A square has ___ sides.',
    options: ['2', '3', '4', '5'],
    correctAnswer: 2, // 4
    difficulty: 1,
    skill: 'Geometry',
    grade: '3',
    subject: 'Math',
    damage: 15
  },
  {
    id: 'g3-math-15',
    text: '100 - 1 = ?',
    options: ['90', '99', '101', '110'],
    correctAnswer: 1, // 99
    difficulty: 2,
    skill: 'Subtraction',
    grade: '3',
    subject: 'Math',
    damage: 20
  },

  // --- SCIENCE (16-30) ---
  {
    id: 'g3-sci-16',
    text: 'Which of these is a Living Thing?',
    options: ['A Car', 'A Tree', 'A Teddy Bear', 'A Cloud'],
    correctAnswer: 1, // A Tree
    difficulty: 1,
    skill: 'Living Things',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-17',
    text: 'What do we use our nose for?',
    options: ['Seeing', 'Hearing', 'Smelling', 'Tasting'],
    correctAnswer: 2, // Smelling
    difficulty: 1,
    skill: 'Human Body',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-18',
    text: 'Which animal eats only plants (Herbivore)?',
    options: ['Lion', 'Cow', 'Dog', 'Tiger'],
    correctAnswer: 1, // Cow
    difficulty: 2,
    skill: 'Animals',
    grade: '3',
    subject: 'Science',
    damage: 20
  },
  {
    id: 'g3-sci-19',
    text: 'Where does a bird live?',
    options: ['Den', 'Nest', 'Kennel', 'Stable'],
    correctAnswer: 1, // Nest
    difficulty: 1,
    skill: 'Habitats',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-20',
    text: 'What does a plant need to grow?',
    options: ['Ice cream', 'Sunlight and Water', 'Toys', 'Darkness'],
    correctAnswer: 1, // Sunlight and Water
    difficulty: 1,
    skill: 'Plants',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-21',
    text: 'Which is a source of water?',
    options: ['Mountain', 'River', 'Road', 'Desert'],
    correctAnswer: 1, // River
    difficulty: 2,
    skill: 'Environment',
    grade: '3',
    subject: 'Science',
    damage: 20
  },
  {
    id: 'g3-sci-22',
    text: 'We wear woollen clothes in which season?',
    options: ['Summer', 'Winter', 'Rainy', 'Spring'],
    correctAnswer: 1, // Winter
    difficulty: 1,
    skill: 'Seasons',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-23',
    text: 'Which of these is a wild animal?',
    options: ['Dog', 'Cat', 'Tiger', 'Cow'],
    correctAnswer: 2, // Tiger
    difficulty: 1,
    skill: 'Animals',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-24',
    text: 'Which part of the plant is under the ground?',
    options: ['Leaf', 'Flower', 'Root', 'Stem'],
    correctAnswer: 2, // Root
    difficulty: 2,
    skill: 'Plants',
    grade: '3',
    subject: 'Science',
    damage: 20
  },
  {
    id: 'g3-sci-25',
    text: 'Which traffic light tells you to STOP?',
    options: ['Green', 'Yellow', 'Red', 'Blue'],
    correctAnswer: 2, // Red
    difficulty: 1,
    skill: 'Safety',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-26',
    text: 'Ice is water in which form?',
    options: ['Gas', 'Solid', 'Liquid', 'Vapor'],
    correctAnswer: 1, // Solid
    difficulty: 2,
    skill: 'States of Matter',
    grade: '3',
    subject: 'Science',
    damage: 20
  },
  {
    id: 'g3-sci-27',
    text: 'The sun rises in the...',
    options: ['West', 'North', 'East', 'South'],
    correctAnswer: 2, // East
    difficulty: 2,
    skill: 'Earth',
    grade: '3',
    subject: 'Science',
    damage: 20
  },
  {
    id: 'g3-sci-28',
    text: 'Which food is healthy?',
    options: ['Chips', 'Fruits', 'Soda', 'Candy'],
    correctAnswer: 1, // Fruits
    difficulty: 1,
    skill: 'Health',
    grade: '3',
    subject: 'Science',
    damage: 15
  },
  {
    id: 'g3-sci-29',
    text: 'How many legs does a spider have?',
    options: ['2', '4', '6', '8'],
    correctAnswer: 3, // 8
    difficulty: 2,
    skill: 'Insects',
    grade: '3',
    subject: 'Science',
    damage: 20
  },
  {
    id: 'g3-sci-30',
    text: 'What comes from a hen?',
    options: ['Milk', 'Egg', 'Wool', 'Honey'],
    correctAnswer: 1, // Egg
    difficulty: 1,
    skill: 'Animals',
    grade: '3',
    subject: 'Science',
    damage: 15
  },

  // --- ENGLISH (31-40) ---
  {
    id: 'g3-eng-31',
    text: 'Choose the correct plural: One Cat, Two...',
    options: ['Cates', 'Cats', 'Cat', 'Kittens'],
    correctAnswer: 1, // Cats
    difficulty: 2,
    skill: 'Grammar',
    grade: '3',
    subject: 'English',
    damage: 20
  },
  {
    id: 'g3-eng-32',
    text: 'Identify the Verb (Action word):',
    options: ['Boy', 'Run', 'Big', 'Table'],
    correctAnswer: 1, // Run
    difficulty: 1,
    skill: 'Grammar',
    grade: '3',
    subject: 'English',
    damage: 15
  },
  {
    id: 'g3-eng-33',
    text: 'The book is _____ the table.',
    options: ['In', 'On', 'At', 'To'],
    correctAnswer: 1, // On
    difficulty: 2,
    skill: 'Prepositions',
    grade: '3',
    subject: 'English',
    damage: 20
  },
  {
    id: 'g3-eng-34',
    text: 'What is the opposite of Hot?',
    options: ['Warm', 'Big', 'Cold', 'Wet'],
    correctAnswer: 2, // Cold
    difficulty: 1,
    skill: 'Vocabulary',
    grade: '3',
    subject: 'English',
    damage: 15
  },
  {
    id: 'g3-eng-35',
    text: 'Choose the correct spelling.',
    options: ['Scool', 'School', 'Skool', 'Shool'],
    correctAnswer: 1, // School
    difficulty: 2,
    skill: 'Spelling',
    grade: '3',
    subject: 'English',
    damage: 20
  },
  {
    id: 'g3-eng-36',
    text: 'Complete the sentence: She _____ playing.',
    options: ['is', 'are', 'am', 'were'],
    correctAnswer: 0, // is
    difficulty: 2,
    skill: 'Grammar',
    grade: '3',
    subject: 'English',
    damage: 20
  },
  {
    id: 'g3-eng-37',
    text: 'Which word describes a color?',
    options: ['Circle', 'Blue', 'Loud', 'Soft'],
    correctAnswer: 1, // Blue
    difficulty: 1,
    skill: 'Vocabulary',
    grade: '3',
    subject: 'English',
    damage: 15
  },
  {
    id: 'g3-eng-38',
    text: '"Tom has a red ball. He plays in the park." What color is the ball?',
    options: ['Blue', 'Green', 'Red', 'Yellow'],
    correctAnswer: 2, // Red
    difficulty: 1,
    skill: 'Reading',
    grade: '3',
    subject: 'English',
    damage: 15
  },
  {
    id: 'g3-eng-39',
    text: 'Use A, An, or The: I saw ___ elephant.',
    options: ['A', 'An', 'The', 'Two'],
    correctAnswer: 1, // An
    difficulty: 2,
    skill: 'Grammar',
    grade: '3',
    subject: 'English',
    damage: 20
  },
  {
    id: 'g3-eng-40',
    text: 'Which sentence is correct?',
    options: ['The sky is blue.', 'The sky blue is.', 'Blue is sky the.', 'Is blue the sky.'],
    correctAnswer: 0, // The sky is blue.
    difficulty: 2,
    skill: 'Sentence Structure',
    grade: '3',
    subject: 'English',
    damage: 20
  }
];
