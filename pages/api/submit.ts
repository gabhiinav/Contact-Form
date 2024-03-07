import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

// Define the SheetForm interface for request body validation
type SheetForm = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for allowed HTTP method (POST only)
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }

  // Parse the request body as SheetForm
  const body = req.body as SheetForm;

  try {
    // Initialize Google Sheets API client with authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      // Define required scopes for accessing Google Drive and Sheets
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Append data to the specified spreadsheet and range
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
      range: "A1:D1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[body.name, body.email, body.email, body.message]],
      },
    });

    // Send successful response with data
    return res.status(200).json({
      data: response.data,
    });
  } catch (e) {
    return res.status(500).send({ message: "Something went wrong" });
  }
}
