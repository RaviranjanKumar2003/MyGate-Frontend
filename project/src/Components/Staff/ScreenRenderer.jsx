import EnterCode from "./Screens/EnterCode.jsx";
import Visitor from "./Screens/Visitor.jsx";
import FrequentVisitor from "./Screens/FrequentVisitor.jsx";
import Notice from "./Screens/SNotice.jsx";
import Guest from "./Screens/Guest.jsx";
import Delivery from "./Screens/Delivery.jsx";
import Cab from "./Screens/Cab.jsx";
import More from "./Screens/More.jsx"
import AddData from "./Screens/AddData.jsx";
import KidCheck from "./Screens/KidCheck.jsx";
import ThreeDot from "./Screens/ThreeDot.jsx";

function ScreenRenderer({ activeTab ,setActiveTab }) {
  switch (activeTab) {
    case "ENTER_CODE": return <EnterCode />;
    case "VISITOR": return <Visitor />;
    case "FREQ_VISITOR": return <FrequentVisitor />;
    case "NOTICE": return <Notice />;
    case "GUEST": return <Guest />;
    case "DELIVERY": return <Delivery />;
    case "CAB": return <Cab />;
    case "MORE": return <More setActiveTab={setActiveTab} />;
    case "THREE_DOT": return <ThreeDot setActiveTab={setActiveTab} />;
    case "ADD_DATA": return <AddData setActiveTab={setActiveTab} />;
    case "KID_CHECK": return <KidCheck setActiveTab={setActiveTab} />;
    default: return null;
  }
}

export default ScreenRenderer;
