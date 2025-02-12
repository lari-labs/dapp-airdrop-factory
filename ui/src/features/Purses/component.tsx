import { usePurse } from '../../hooks/usePurse.ts';

const filter = (data, fn) => data.map(fn);

const isBrandPetname = (x, y) =>
  x.filter(({ brandPetname }) => y.indexOf(brandPetname) !== -1);

export const Card = ({
  imageUrl = 'https://placehold.co/120x50',
  title = 'Default Title',
  description = '0n',
}) => (
  <div className="w-96 rounded-lg border bg-white p-6 shadow-xl ">
    <div className="flex items-center">
      <img
        src={imageUrl}
        alt="Profile"
        className="mr-4 h-12 w-12 rounded-full"
      />
      <div className="flex flex-col">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>
    </div>
    <p className="mt-4 text-gray-600">Current balance: {description}</p>
  </div>
);
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
