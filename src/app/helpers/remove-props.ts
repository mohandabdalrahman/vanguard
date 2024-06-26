const unNeededProps = ["deleted", "creatorId", "version", "lastModifiedDate"];
export const removeUnNeededProps = (obj, props?: string[]) => {
  const allUnNeededProps = [];
  if (props?.length > 0) {
    allUnNeededProps.push(...props, ...unNeededProps);
  } else {
    allUnNeededProps.push(...unNeededProps);
  }
  allUnNeededProps.forEach((prop) => {
    delete obj[prop];
  });

  return obj;
};
