import { usePurse } from '../../hooks/usePurse.ts';

const filter = (data, fn) => data.map(fn);

const isBrandPetname = (x, y) =>
  x.filter(({ brandPetname }) => y.indexOf(brandPetname) !== -1);

const PurseDetails = ({ purses = [], brands }) => {
  const targetBrands = isBrandPetname(purses, brands);
  console.log('targetBrands', targetBrands);
  console.log('------------------------');
  console.log('targetBrands::', targetBrands);
  return (
    <div>
      {targetBrands.map(({ brandPetname }) => (
        <p>
          <b>Brand Name:</b>
          {brandPetname}
        </p>
      ))}
    </div>
  );
};

export default PurseDetails;
