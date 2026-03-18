import { cronJobs } from "convex/server";

const crons = cronJobs();

// Crons desativados — o sistema agora funciona sob demanda.
// O usuário busca domínios manualmente via painel de busca.
//
// Para reativar mineração automática no futuro, descomente:
//
// import { internal } from "./_generated/api";
// crons.interval("discovery", { hours: 6 }, internal.jobs.runDiscovery);
// crons.interval("classify",  { hours: 2 }, internal.jobs.runClassify);
// crons.interval("scoring",   { hours: 12 }, internal.jobs.runScoring);
// crons.interval("alerts",    { hours: 3 }, internal.jobs.runAlerts);

export default crons;
