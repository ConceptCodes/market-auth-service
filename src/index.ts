import App from "@/app";
import HealthRoute from "@route/health";
import AuthRoute from "@route/auth";

export const app = new App([
  new HealthRoute(),
  new AuthRoute(),
]);

app.listen();
