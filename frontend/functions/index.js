import * as v1 from "firebase-functions/v1";
import * as v2 from "firebase-functions/v2";
import admin from "firebase-admin";


admin.initializeApp();


export const NewRequirement= v1.firestore.document("/requirements/{docID}")
    .onCreate((snapshot) => {
        const data = snapshot.data();

        console.log("New requirement created:", data);

        return Promise.resolve();
    });

export const ShowAllRequirement= v2.https.onRequest(async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection("requirements").get();

        if (snapshot.empty) {
            return res.status(404).send("No hay requerimientos en la base de datos.");
        }

        const requirements = [];
        snapshot.forEach(doc => {
            requirements.push({ id: doc.id, ...doc.data() }); // Agrega el ID del documento
        });

        res.json(requirements);
    } catch (error) {
        res.status(500).send(`Error en el servidor: ${error.message}`);
    }
});

export const VerifyDocument = v1.firestore.document("{collection}/{docID}")
    .onWrite(async (change, context) => {
        const newData = change.after.exists ? change.after.data() : null; // Datos después del cambio
        const oldData = change.before.exists ? change.before.data() : null; // Datos antes del cambio

        // Si el documento fue eliminado, no hacemos nada
        if (!newData) {
            console.log(`Documento eliminado en ${context.params.collection}/${context.params.docID}`);
            return null;
        }

        // Verificar que ningún campo esté vacío
        const emptyFields = Object.entries(newData).filter(([key, value]) => value === null || value === undefined || value === "");

        if (emptyFields.length > 0) {
            console.error(`El documento ${context.params.docID} en la colección ${context.params.collection} tiene campos vacíos:`, emptyFields);

            if (!oldData) {
                // Si es un documento nuevo, eliminarlo
                console.log(`Eliminando el documento ${context.params.docID} debido a campos vacíos.`);
                await change.after.ref.delete();
            } else {
                // Si es una edición, revertir los cambios al estado anterior
                console.log(`Revirtiendo cambios en el documento ${context.params.docID} debido a campos vacíos.`);
                await change.after.ref.set(oldData, { merge: true });
            }

            return null;
        }

        console.log(`Documento válido en ${context.params.collection}/${context.params.docID}:`, newData);
        return null;
    });
