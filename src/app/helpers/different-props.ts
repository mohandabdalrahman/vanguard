export const getDifferenceProps = <T>(obj1: T, obj2: T) => {
  let differPropsObj = {};
  Object.keys(obj1).forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      return (differPropsObj[key] = obj1[key]);
    }
  });
  return differPropsObj;
};

export const getSimilarProps = (obj1: any, obj2: any) => {
  let samePropsObj = {};
  Object.keys(obj1).forEach((key) => {
    if (obj1[key] === obj2[key]) {
      return (samePropsObj[key] = obj1[key]);
    }
  });
  return samePropsObj;
};
