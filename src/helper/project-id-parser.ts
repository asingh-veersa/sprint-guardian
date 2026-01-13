import env from "../config/env";

export default () => {
  const projectIds = env.gitlab.projectIds;

  const ids = projectIds
    ?.split(",")
    .map((id: string) => Number(id.trim()))
    .filter(Boolean);

    return ids;
};
