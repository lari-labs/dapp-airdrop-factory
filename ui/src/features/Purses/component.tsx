import { usePurse } from '../../hooks/usePurse.ts';

const filter = (data, fn) => data.map(fn);

const isBrandPetname = (x, y) =>
  x.filter(({ brandPetname }) => y.indexOf(brandPetname) !== -1);

export const Card = ({
  imageUrl = 'https://placehold.co/120x50',
  title = 'Default Title',
  description = '0n',
}) => (
  <div className="w-full rounded-lg border bg-transparent p-8 shadow-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] backdrop-blur-sm">
    <div className="flex items-center">
      <img
        src={imageUrl}
        alt="Profile"
        className="mr-4 h-12 w-12 rounded-full"
      />
      <div className="flex flex-col">
        <h2 className="text-4xl font-bold">{title}</h2>
      </div>
    </div>
    <p className="mt-4 text-lg text-white">
      $TRIBBLES Claimed: <b> {description}</b>
    </p>
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
