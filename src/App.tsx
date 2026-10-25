import { Footer, Header } from "./components/app/Header";
import { useRoute } from "./lib/router";
import { SessionProvider } from "./lib/session";
import { Analyzing } from "./pages/Analyzing";
import { Compare } from "./pages/Compare";
import { Explore } from "./pages/Explore";
import { Lab } from "./pages/Lab";
import { Landing } from "./pages/Landing";
import { ProgramPage } from "./pages/Program";
import { Result } from "./pages/Result";
import { Test } from "./pages/Test";

function Routes() {
  const route = useRoute();
  const [head, arg] = route.path;
  let page;
  switch (head) {
    case "tes": page = <Test />; break;
    case "analisis": page = <Analyzing />; break;
    case "hasil": page = <Result />; break;
    case "prodi": page = <ProgramPage id={arg ?? ""} />; break;
    case "bandingkan": page = <Compare route={route} />; break;
    case "jelajah": page = <Explore />; break;
    case "uji": page = <Lab />; break;
    default: page = <Landing />;
  }
  return (
    <>
      <Header route={route} />
      <main id="main">{page}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <Routes />
    </SessionProvider>
  );
}
