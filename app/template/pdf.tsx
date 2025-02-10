import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";


interface PdfProps {
    name: string;
    email: string;
    amount: string;
    date: string;
    description: string;
    accountNumber: string;
    url: string;
};

export default function Pdf({
    name,
    email,
    amount,
    date,
    description,
    accountNumber,
    url
}: PdfProps) {
    const styles = StyleSheet.create({
        page: {
            backgroundColor: '#fff',
            height: '100vh',
            padding: 40,
            position: 'relative',
        },
        section: {
            margin: 10,
            padding: 10,
            flexGrow: 1,
            textAlign: 'center'
        },
        column: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
            margin: 10,
            border: '1px solid #000'
        },
        row: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            margin: 10
        },
        text: {
            margin: 10,
            fontSize: 12
        },
        header: {
            fontSize: 16,
            padding: 10,
            textAlign: 'center',
            fontWeight: 'bold'
        },
        date: {
            position: 'absolute',
            top: 20,
            right: 20,
            fontSize: 12
        },
        logo: {
            fontSize: 18,
            position: 'absolute',
            top: 20,
            left: 20,
            fontWeight: 'extrabold'
        }
    });

    const formattedDate = new Date(date).toLocaleDateString('nb-NO');

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
            </Page>
            <Page size="A4" style={styles.page}>
                <Image src={url} />
            </Page>
        </Document>
    );
};