import axios from "axios";

export default async (request, response) => {
  const url = request.query.u;

  const data = (await axios.get(url)).data;

  response.statusCode = 200;
  response.send(data);
};
