export interface DefaultCategory {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  icon: string;
  color: string;
  subcategories?: { id: string; name: string }[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  // Income Categories
  {
    id: 'income_salary',
    name: 'Salary & Wages',
    type: 'income',
    icon: 'briefcase',
    color: '#22c55e',
    subcategories: [
      { id: 'income_salary_regular', name: 'Regular Salary' },
      { id: 'income_salary_bonus', name: 'Bonus' },
      { id: 'income_salary_overtime', name: 'Overtime' },
    ],
  },
  {
    id: 'income_investment',
    name: 'Investment Income',
    type: 'income',
    icon: 'trending-up',
    color: '#10b981',
    subcategories: [
      { id: 'income_investment_dividends', name: 'Dividends' },
      { id: 'income_investment_interest', name: 'Interest' },
      { id: 'income_investment_capital_gains', name: 'Capital Gains' },
    ],
  },
  {
    id: 'income_freelance',
    name: 'Freelance & Side Income',
    type: 'income',
    icon: 'laptop',
    color: '#14b8a6',
  },
  {
    id: 'income_other',
    name: 'Other Income',
    type: 'income',
    icon: 'plus-circle',
    color: '#06b6d4',
    subcategories: [
      { id: 'income_other_gifts', name: 'Gifts Received' },
      { id: 'income_other_refunds', name: 'Refunds' },
      { id: 'income_other_misc', name: 'Miscellaneous' },
    ],
  },

  // Expense Categories
  {
    id: 'expense_housing',
    name: 'Housing',
    type: 'expense',
    icon: 'home',
    color: '#f59e0b',
    subcategories: [
      { id: 'expense_housing_rent', name: 'Rent' },
      { id: 'expense_housing_mortgage', name: 'Mortgage' },
      { id: 'expense_housing_utilities', name: 'Utilities' },
      { id: 'expense_housing_maintenance', name: 'Maintenance' },
      { id: 'expense_housing_insurance', name: 'Home Insurance' },
      { id: 'expense_housing_taxes', name: 'Property Taxes' },
    ],
  },
  {
    id: 'expense_transportation',
    name: 'Transportation',
    type: 'expense',
    icon: 'car',
    color: '#8b5cf6',
    subcategories: [
      { id: 'expense_transportation_fuel', name: 'Fuel' },
      { id: 'expense_transportation_parking', name: 'Parking' },
      { id: 'expense_transportation_public', name: 'Public Transit' },
      { id: 'expense_transportation_rideshare', name: 'Rideshare' },
      { id: 'expense_transportation_maintenance', name: 'Car Maintenance' },
      { id: 'expense_transportation_insurance', name: 'Auto Insurance' },
      { id: 'expense_transportation_payment', name: 'Car Payment' },
    ],
  },
  {
    id: 'expense_food',
    name: 'Food & Dining',
    type: 'expense',
    icon: 'utensils',
    color: '#ef4444',
    subcategories: [
      { id: 'expense_food_groceries', name: 'Groceries' },
      { id: 'expense_food_restaurants', name: 'Restaurants' },
      { id: 'expense_food_coffee', name: 'Coffee Shops' },
      { id: 'expense_food_delivery', name: 'Food Delivery' },
      { id: 'expense_food_alcohol', name: 'Alcohol & Bars' },
    ],
  },
  {
    id: 'expense_healthcare',
    name: 'Healthcare',
    type: 'expense',
    icon: 'heart-pulse',
    color: '#ec4899',
    subcategories: [
      { id: 'expense_healthcare_insurance', name: 'Health Insurance' },
      { id: 'expense_healthcare_doctor', name: 'Doctor Visits' },
      { id: 'expense_healthcare_pharmacy', name: 'Pharmacy' },
      { id: 'expense_healthcare_dental', name: 'Dental' },
      { id: 'expense_healthcare_vision', name: 'Vision' },
    ],
  },
  {
    id: 'expense_entertainment',
    name: 'Entertainment',
    type: 'expense',
    icon: 'film',
    color: '#a855f7',
    subcategories: [
      { id: 'expense_entertainment_streaming', name: 'Streaming Services' },
      { id: 'expense_entertainment_events', name: 'Events & Concerts' },
      { id: 'expense_entertainment_games', name: 'Games' },
      { id: 'expense_entertainment_hobbies', name: 'Hobbies' },
    ],
  },
  {
    id: 'expense_shopping',
    name: 'Shopping',
    type: 'expense',
    icon: 'shopping-bag',
    color: '#f97316',
    subcategories: [
      { id: 'expense_shopping_clothing', name: 'Clothing' },
      { id: 'expense_shopping_electronics', name: 'Electronics' },
      { id: 'expense_shopping_household', name: 'Household Items' },
      { id: 'expense_shopping_gifts', name: 'Gifts' },
    ],
  },
  {
    id: 'expense_personal',
    name: 'Personal Care',
    type: 'expense',
    icon: 'user',
    color: '#06b6d4',
    subcategories: [
      { id: 'expense_personal_haircare', name: 'Haircare' },
      { id: 'expense_personal_gym', name: 'Gym & Fitness' },
      { id: 'expense_personal_spa', name: 'Spa & Wellness' },
    ],
  },
  {
    id: 'expense_education',
    name: 'Education',
    type: 'expense',
    icon: 'graduation-cap',
    color: '#3b82f6',
    subcategories: [
      { id: 'expense_education_tuition', name: 'Tuition' },
      { id: 'expense_education_books', name: 'Books & Supplies' },
      { id: 'expense_education_courses', name: 'Online Courses' },
    ],
  },
  {
    id: 'expense_financial',
    name: 'Financial',
    type: 'expense',
    icon: 'credit-card',
    color: '#64748b',
    subcategories: [
      { id: 'expense_financial_fees', name: 'Bank Fees' },
      { id: 'expense_financial_interest', name: 'Interest Payments' },
      { id: 'expense_financial_taxes', name: 'Taxes' },
    ],
  },
  {
    id: 'expense_travel',
    name: 'Travel',
    type: 'expense',
    icon: 'plane',
    color: '#0ea5e9',
    subcategories: [
      { id: 'expense_travel_flights', name: 'Flights' },
      { id: 'expense_travel_hotels', name: 'Hotels' },
      { id: 'expense_travel_rental', name: 'Car Rental' },
      { id: 'expense_travel_activities', name: 'Activities' },
    ],
  },
  {
    id: 'expense_other',
    name: 'Other Expenses',
    type: 'expense',
    icon: 'more-horizontal',
    color: '#94a3b8',
  },

  // Transfer Categories
  {
    id: 'transfer_internal',
    name: 'Internal Transfer',
    type: 'transfer',
    icon: 'arrow-right-left',
    color: '#6366f1',
  },
  {
    id: 'transfer_investment',
    name: 'Investment Transfer',
    type: 'transfer',
    icon: 'bar-chart-2',
    color: '#8b5cf6',
  },
  {
    id: 'transfer_debt_payment',
    name: 'Debt Payment',
    type: 'transfer',
    icon: 'credit-card',
    color: '#f43f5e',
  },
];
