import { Box } from "@mui/material";

const UserImage = ({ image, size = "60px" }) => {
  const isS3Image = image.startsWith('https://awssocialmedia.s3.eu-north-1.amazonaws.com/');

  return (
    <Box width={size} height={size}>
      <img
        style={{ objectFit: "cover", borderRadius: "50%" }}
        width={size}
        height={size}
        alt="user"
        src={isS3Image? image : `https://social-media-server-flax.vercel.app/assets/${image}`}
      />
    </Box>
  );
};

export default UserImage;