// Simplified for Turso - no replica support needed
export type ReplicatedDatabase<Q> = Q & {
  $primary?: Q;
  usePrimaryOnly?: () => Q;
};

export const withReplicas = <Q>(
  primary: Q,
  replicas: [Q, ...Q[]],
  getReplica?: (replicas: Q[]) => Q,
): ReplicatedDatabase<Q> => {
  // Turso handles replication internally, just return the primary
  return primary as ReplicatedDatabase<Q>;
};
