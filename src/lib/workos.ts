import { WorkOS } from "@workos-inc/node";

function lazy<T>(fn: () => T): () => T {
  let called = false;
  let result: T;
  return () => {
    if (!called) {
      result = fn();
      called = true;
    }
    return result;
  };
}

function createWorkOS() {
  return new WorkOS(process.env.WORKOS_API_KEY!, {
    clientId: process.env.WORKOS_CLIENT_ID!,
  });
}

export const getWorkOS = lazy(createWorkOS);
