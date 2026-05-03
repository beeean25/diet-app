import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return session ? <Dashboard /> : <Login />;
}

export default App;