const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { username, password } = JSON.parse(event.body);

    // Validate input
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Username and password are required' })
      };
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('username', username)
      .single();

    if (existingUser) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Username already exists' })
      };
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ username, password }])
      .select()
      .single();

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({ user: newUser })
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};
