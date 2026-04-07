import type { ReactNode } from "react";

type AppProps = {
  children: ReactNode;
};

function App({ children }: AppProps) {
  return <>{children}</>;
}

export default App;
