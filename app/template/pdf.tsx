import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";

interface PdfProps {
  name: string;
  email: string;
  amount: string;
  date: string;
  description: string;
  accountNumber: string;
  signature: string;
  receipts: string[];
}

export default function Pdf({
  name,
  email,
  amount,
  date,
  description,
  accountNumber,
  signature,
  receipts,
}: PdfProps) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#fff",
      height: "100vh",
      padding: 40,
      position: "relative",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
      textAlign: "center",
    },
    column: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      width: "100%",
      margin: 10,
      border: "1px solid #000",
    },
    row: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      margin: 10,
    },
    text: {
      margin: 10,
      fontSize: 12,
    },
    header: {
      fontSize: 16,
      padding: 10,
      textAlign: "center",
      fontWeight: "bold",
    },
    date: {
      position: "absolute",
      top: 20,
      right: 20,
      fontSize: 12,
    },
    logo: {
      fontSize: 18,
      position: "absolute",
      top: 20,
      left: 20,
      fontWeight: "extrabold",
    },
    bottomLeftBox: {
      position: "absolute",
      bottom: 20,
      left: 20,
      padding: 10,
      border: "1px solid #000",
      fontSize: 12,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    receiptImage: {
      width: "100%",
      maxHeight: 300,
      objectFit: "contain",
      marginVertical: 5,
    },
    receiptContainer: {
      width: "100%",
      padding: 10,
      marginVertical: 5,
    },
  });

  // Parse date without timezone conversion to avoid day shift
  const [year, month, day] = date.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = dateObj.toLocaleDateString("nb-NO");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.logo}>TIHLDE</Text>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.header}>Fullt navn:</Text>
            <Text style={styles.text}>{name}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.header}>E-post:</Text>
            <Text style={styles.text}>{email}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.header}>Kontonummer:</Text>
            <Text style={styles.text}>{accountNumber}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.header}>Beløp:</Text>
            <Text style={styles.text}>{amount}</Text>
          </View>
        </View>
        <View style={styles.column}>
          <Text style={styles.header}>Årsak til utlegg:</Text>
          <Text style={styles.text}>{description}</Text>
        </View>
        <View style={styles.column}>
          <Text style={styles.header}>Kvitteringer:</Text>
          {receipts.map((receipt, index) => (
            <View key={index} style={styles.receiptContainer}>
              <Text style={styles.text}>Kvittering {index + 1}:</Text>
              <Image src={receipt} style={styles.receiptImage} />
            </View>
          ))}
        </View>
        <View style={styles.bottomLeftBox}>
          <Text>Signatur:</Text>
          <Text>{signature}</Text>
        </View>
      </Page>
    </Document>
  );
}
