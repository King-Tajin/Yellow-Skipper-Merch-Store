import { LazyMotion, domAnimation } from "@/lib/motion";
import StorePage from "@/components/store/StorePage";

export default function App() {
  return (
    <LazyMotion features={domAnimation}>
      <StorePage />
    </LazyMotion>
  );
}
